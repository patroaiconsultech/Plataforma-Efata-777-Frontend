import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createInvite } from "../api";
import PwaInstallButton from "../components/PwaInstallButton";

export default function AppConsole() {
  const [message, setMessage] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const threadId =
    new URLSearchParams(window.location.search).get("thread") || "";

  async function invite() {
    if (!threadId) {
      window.alert("Abra uma thread antes de convidar.");
      return;
    }
    const out = await createInvite(threadId, {
      email,
      role: "participant",
      history_access: "from_join",
    });
    setInviteUrl(out.invitation_url);
  }

  return (
    <div className="console-shell">
      <aside className="console-sidebar" aria-label="Navegação do console">
        <Link className="brand-lockup brand-lockup--compact" to="/">
          <span className="brand-orb" aria-hidden="true" />
          <span>ORKIO™</span>
        </Link>
        <button type="button" className="primary-button">
          + Nova conversa
        </button>
        <nav className="conversation-nav" aria-label="Conversas">
          <strong>Conversas</strong>
          <span>Nenhuma conversa selecionada</span>
        </nav>
        <PwaInstallButton compact />
      </aside>

      <main id="main-content" className="console-main">
        <header className="console-header">
          <div>
            <b>ORKIO Command Center</b>
            <small>Collaborative Intelligence</small>
          </div>
          <div className="console-header__actions">
            <Link className="ghost-link" to="/">
              Início
            </Link>
            <button type="button" onClick={() => setShowInvite(true)}>
              + Convidar
            </button>
          </div>
        </header>

        <section className="thread" aria-label="Conversa">
          <article className="message agent">
            <b>Orkio</b>
            <p>Onde a inteligência encontra harmonia.</p>
          </article>
        </section>

        <footer className="composer">
          <label className="icon-button" aria-label="Anexar arquivo">
            <span aria-hidden="true">📎</span>
            <input type="file" hidden />
          </label>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowInvite(true)}
            aria-label="Convidar participante"
          >
            👥
          </button>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Digite sua mensagem."
            aria-label="Mensagem"
          />
          <button
            type="button"
            className="icon-button"
            aria-label="Voz"
            disabled
          >
            🎙
          </button>
          <button type="button" className="primary-button composer__send">
            Enviar
          </button>
        </footer>
      </main>

      {showInvite ? (
        <div className="modal" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <h2 id="invite-title">Convidar participante</h2>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@empresa.com"
              />
            </label>
            <p>
              Função: Participante · Histórico: a partir da entrada ·
              Validade: 72 horas
            </p>
            {inviteUrl ? <output>{inviteUrl}</output> : null}
            <div className="modal-card__actions">
              <button type="button" onClick={() => setShowInvite(false)}>
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={invite}>
                Gerar convite
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
