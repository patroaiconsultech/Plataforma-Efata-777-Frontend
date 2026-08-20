import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, validateAccessCode } from "../api";
import { beginLogin, isOidcConfigured } from "../auth/oidc";
import "../access.css";

export const ONBOARDING_DRAFT_KEY = "patroai_hyper_cocreator_onboarding";

type Step = "code" | "cocreator" | "objective" | "identity";
const GOALS = [
  "Criar uma nova oferta",
  "Repensar meu modelo de negócio",
  "Resolver um desafio operacional",
  "Explorar uma ideia ainda crua",
];

function storeDraft(input: {
  grant: string;
  co_creator_name: string;
  onboarding_goal: string;
}) {
  sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(input));
}

export default function AccessPortal() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<Step>("code");
  const [grant, setGrant] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startLogin(returnTo = "/app") {
    if (!isOidcConfigured()) {
      setError("O provedor de identidade não está configurado nesta implantação.");
      return;
    }
    await beginLogin(returnTo);
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const response = await validateAccessCode(code.trim());
      setGrant(response.grant);
      setStep("cocreator");
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "NETWORK_ERROR";
      const message =
        code === "ACCESS_CODE_INVALID"
          ? "Código não reconhecido."
          : code === "ACCESS_GATE_DISABLED"
            ? "O cadastro por código ainda não está habilitado no backend desta implantação."
            : code === "ACCESS_GATE_NOT_CONFIGURED"
              ? "O acesso por código está habilitado, mas a configuração segura dos códigos ainda está incompleta no backend."
              : code === "NETWORK_ERROR"
              ? "Não foi possível alcançar o backend para validar o código."
              : `Não foi possível validar o código (${code}).`;
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) return;
    setName(clean);
    setStep("objective");
  }

  async function continueToIdentity() {
    if (!grant || !name || !goal) return;
    storeDraft({ grant, co_creator_name: name, onboarding_goal: goal });
    setStep("identity");
    await startLogin("/app?onboarding=1");
  }

  return (
    <main className="access-portal" id="main-content">
      <div className="access-portal__glow" aria-hidden="true" />
      <section className="access-card" aria-labelledby="access-title">
        <Link className="access-card__back" to="/">← Voltar à experiência</Link>
        <p className="access-eyebrow">PATROAI · ACESSO PRIVADO</p>
        <h1 id="access-title">Entre na PatroAI.</h1>
        <p className="access-lead">
          Um único Hyper Co-Criador PatroAI para transformar ideias, decisões e desafios
          do seu negócio em caminhos concretos.
        </p>

        <div className="access-tabs">
          <button className={mode === "register" ? "active" : ""} onClick={() => {setMode("register"); setStep("code"); setError("");}}>
            Criar conta
          </button>
          <button className={mode === "login" ? "active" : ""} onClick={() => {setMode("login"); setError("");}}>
            Já tenho conta
          </button>
        </div>

        {mode === "login" ? (
          <div className="access-step">
            <span>LOGIN</span>
            <h2>Bem-vindo de volta.</h2>
            <p>Seu login e sua senha são protegidos pelo provedor de identidade da PatroAI.</p>
            <button className="access-primary" onClick={() => void startLogin("/app")}>
              Entrar com segurança
            </button>
          </div>
        ) : null}

        {mode === "register" && step === "code" ? (
          <form className="access-step" onSubmit={submitCode}>
            <span>ETAPA 1 DE 3</span><h2>Informe seu código de acesso.</h2>
            <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" placeholder="Código de acesso" />
            <button className="access-primary" disabled={busy}>{busy ? "Validando…" : "Validar código"}</button>
          </form>
        ) : null}

        {mode === "register" && step === "cocreator" ? (
          <form className="access-step" onSubmit={submitName}>
            <span>ETAPA 2 DE 3</span><h2>Dê um nome ao seu Co-Criador.</h2>
            <p>Este é o único momento do onboarding em que você define o nome que verá na experiência.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={64} placeholder="Ex.: Atlas, Sophia, Nexo…" />
            <button className="access-primary">Continuar</button>
          </form>
        ) : null}

        {mode === "register" && step === "objective" ? (
          <div className="access-step">
            <span>ETAPA 3 DE 3</span><h2>O que vocês vão cocriar primeiro?</h2>
            <div className="access-goals">
              {GOALS.map((item) => (
                <button key={item} className={goal === item ? "selected" : ""} onClick={() => setGoal(item)}>{item}</button>
              ))}
            </div>
            <button className="access-primary" disabled={!goal} onClick={() => void continueToIdentity()}>
              Criar conta e entrar
            </button>
            <p className="access-note">A credencial é criada com segurança pelo provedor de identidade da PatroAI; a plataforma não armazena sua senha.</p>
          </div>
        ) : null}

        {mode === "register" && step === "identity" ? <p>Redirecionando para criação segura da conta…</p> : null}
        {error ? <p className="access-error" role="alert">{error}</p> : null}
      </section>
    </main>
  );
}
