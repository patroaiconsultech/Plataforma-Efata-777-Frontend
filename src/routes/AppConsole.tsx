import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AUTH_REQUIRED_EVENT,
  ApiError,
  AgentDefinition,
  ArtifactMetadata,
  ChatMessage,
  Thread,
  createInvite,
  createThread,
  downloadArtifact,
  getToken,
  isApiBaseConfigured,
  listAgents,
  listMessages,
  listThreads,
  parseArtifactMetadata,
  streamMessage,
  technicalAgentTarget,
  transcribeVoice,
  uploadAttachment,
} from "../api";
import ArtifactCard from "../components/ArtifactCard";
import PwaInstallButton from "../components/PwaInstallButton";
import { beginLogin, isOidcConfigured, logout } from "../auth/oidc";
import {
  formatConversationTimestamp,
  formatDateTimeTitle,
  formatMessageTimestamp,
} from "../utils/chronology";

const AGENT = "Josué";

type VoiceState = "idle" | "recording" | "transcribing" | "review";
const VOICE_MAX_RECORDING_SECONDS = 90;

function formatVoiceElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

/** Traduz códigos do backend em mensagens compreensíveis. */
function describe(error: unknown): string {
  const code = error instanceof ApiError ? error.code : String(error ?? "");
  const table: Record<string, string> = {
    API_BASE_URL_NOT_CONFIGURED:
      "A URL da API não está configurada nesta implantação.",
    LLM_NOT_CONFIGURED:
      "A integração de linguagem ainda não está configurada no servidor.",
    LLM_UPSTREAM_ERROR: "O provedor de linguagem falhou. Tente novamente.",
    LLM_EMPTY_RESPONSE: "O provedor devolveu resposta vazia.",
    AUTH_PROVIDER_REQUIRED: "É necessário autenticar-se para continuar.",
    BEARER_TOKEN_REQUIRED: "Sessão ausente ou expirada.",
    TOKEN_INACTIVE: "Sessão expirada. Autentique-se novamente.",
    TOKEN_ISSUER_INVALID: "O emissor da sessão não é reconhecido.",
    TOKEN_AUDIENCE_INVALID: "A sessão não foi emitida para esta plataforma.",
    IDENTITY_PROVIDER_UNAVAILABLE:
      "O provedor de identidade está temporariamente indisponível.",
    PRINCIPAL_NOT_PROVISIONED:
      "Sua identidade ainda não está provisionada nesta organização.",
    THREAD_NOT_FOUND: "Conversa não encontrada.",
    THREAD_ACCESS_DENIED: "Você não participa desta conversa.",
    THREAD_READ_ONLY: "Seu perfil nesta conversa é somente leitura.",
    INVITE_ROLE_REQUIRED:
      "Apenas o proprietário ou um moderador pode convidar participantes.",
    AGENT_NOT_FOUND: "O agente selecionado não está disponível.",
    ARTIFACTS_DISABLED: "O envio de anexos está desabilitado no servidor.",
    ARTIFACT_METADATA_INVALID:
      "O servidor informou um artefato, mas a metadata terminal é inválida.",
    ARTIFACT_DOWNLOAD_PATH_INVALID:
      "O caminho de download do artefato é inválido.",
    ARTIFACT_DOWNLOAD_PERMISSION_REQUIRED:
      "Você não tem permissão para baixar este artefato.",
    ARTIFACT_NOT_FOUND: "Este artefato não está mais disponível.",
    ARTIFACT_FILE_NOT_FOUND: "O arquivo do artefato não foi localizado.",
    ARTIFACT_INTEGRITY_MISMATCH:
      "A integridade do artefato não pôde ser confirmada.",
    UPLOAD_PERMISSION_REQUIRED: "Você não tem permissão para enviar arquivos.",
    FILE_TOO_LARGE: "Arquivo acima do tamanho máximo permitido.",
    MIME_TYPE_NOT_ALLOWED: "Tipo de arquivo não permitido.",
    REALTIME_STREAMING_DISABLED: "O tempo real está desabilitado no servidor.",
    STT_DISABLED: "A transcrição de voz está desabilitada no servidor.",
    STT_AUDIO_TYPE_NOT_ALLOWED: "Este formato de áudio não é suportado.",
    STT_FILE_TOO_LARGE: "A gravação de voz excede o limite permitido.",
    STT_EMPTY_AUDIO: "Nenhum áudio foi capturado.",
    STT_EMPTY_TRANSCRIPT: "Não foi possível identificar fala nesta gravação.",
    STT_LOCALE_NOT_ALLOWED: "O idioma da gravação não é suportado.",
    STT_DEPENDENCY_NOT_INSTALLED: "O mecanismo de transcrição ainda não está instalado.",
    STT_MODEL_UNAVAILABLE: "O modelo de transcrição está indisponível.",
    STT_TRANSCRIPTION_FAILED: "A transcrição de voz falhou. Tente novamente.",
    STT_TIMEOUT: "A transcrição excedeu o tempo permitido. Tente novamente.",
    STT_CONCURRENCY_LIMIT_REACHED: "O serviço de transcrição está ocupado. Tente novamente.",
    STT_AUDIO_SIGNATURE_MISMATCH: "O conteúdo do áudio não corresponde ao formato informado.",
    PERSISTENCE_FAILED: "A resposta não pôde ser gravada.",
    NETWORK_ERROR: "Falha de rede. Verifique sua conexão.",
  };
  if (table[code]) return table[code];
  if (error instanceof ApiError && error.status === 401)
    return "Sessão ausente ou expirada.";
  return code ? `Não foi possível concluir a ação (${code}).` : "Erro inesperado.";
}

export default function AppConsole() {
  const [message, setMessage] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState<string>(
    () => new URLSearchParams(window.location.search).get("thread") || "",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(() => Boolean(getToken()));
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [showAgents, setShowAgents] = useState(false);
  const [agentsBusy, setAgentsBusy] = useState(false);
  const [agentsError, setAgentsError] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recentAttachment, setRecentAttachment] = useState("");
  const [artifacts, setArtifacts] = useState<ArtifactMetadata[]>([]);
  const [artifactDownloadBusy, setArtifactDownloadBusy] = useState("");
  const [artifactDownloadErrors, setArtifactDownloadErrors] = useState<
    Record<string, string>
  >({});
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceElapsed, setVoiceElapsed] = useState(0);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const voiceSessionRef = useRef(0);
  const voiceTimerRef = useRef<number | null>(null);
  const voiceDeadlineRef = useRef<number | null>(null);
  const voiceAbortRef = useRef<AbortController | null>(null);
  const activeThreadRef = useRef(threadId);
  const voiceTranscriptOwnedRef = useRef(false);
  const configured = isApiBaseConfigured();
  const authConfigured = isOidcConfigured();

  const selectThread = useCallback((id: string) => {
    if (id !== activeThreadRef.current) {
      cancelVoiceCapture(true);
    }
    activeThreadRef.current = id;
    setThreadId(id);
    setMessages([]);
    setStreamingText("");
    setRecentAttachment("");
    setArtifacts([]);
    setArtifactDownloadBusy("");
    setArtifactDownloadErrors({});
    setShowMobileSidebar(false);
    setError("");
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("thread", id);
    else url.searchParams.delete("thread");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const refreshThreads = useCallback(async () => {
    if (!configured || !authenticated) return;
    try {
      const data = await listThreads();
      setThreads(data.items);
    } catch (err) {
      setError(describe(err));
    }
  }, [authenticated, configured]);

  const refreshMessages = useCallback(async () => {
    if (!configured || !authenticated || !threadId) return;
    setLoading(true);
    try {
      setMessages(await listMessages(threadId));
    } catch (err) {
      setError(describe(err));
    } finally {
      setLoading(false);
    }
  }, [authenticated, configured, threadId]);

  const refreshAgents = useCallback(async () => {
    if (!configured || !authenticated) return;
    setAgentsBusy(true);
    setAgentsError("");
    try {
      const catalog = await listAgents();
      setAgents(catalog);
      setSelectedAgent((current) => {
        if (current) {
          return catalog.find((agent) => agent.slug === current.slug) ?? null;
        }
        return (
          catalog.find((agent) => agent.slug.toLowerCase() === "orkio") ??
          catalog[0] ??
          null
        );
      });
    } catch (err) {
      setAgents([]);
      setSelectedAgent(null);
      setAgentsError(describe(err));
    } finally {
      setAgentsBusy(false);
    }
  }, [authenticated, configured]);

  useEffect(() => {
    void refreshAgents();
  }, [refreshAgents]);

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    void refreshMessages();
  }, [refreshMessages]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      voiceSessionRef.current += 1;
      voiceAbortRef.current?.abort();
      if (voiceTimerRef.current !== null) {
        window.clearInterval(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      if (voiceDeadlineRef.current !== null) {
        window.clearTimeout(voiceDeadlineRef.current);
        voiceDeadlineRef.current = null;
      }
      const recorder = voiceRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }
      voiceRecorderRef.current = null;
      voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
      voiceStreamRef.current = null;
      voiceChunksRef.current = [];
    };
  }, []);

  useEffect(() => {
    const handleAuthRequired = () => setAuthenticated(Boolean(getToken()));
    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () =>
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
  }, []);

  function requireAuthenticated(): boolean {
    if (authenticated) return true;
    setError(
      authConfigured
        ? "Autentique-se para continuar."
        : "A autenticação OIDC ainda não está configurada nesta implantação.",
    );
    return false;
  }

  function stopVoiceTracks() {
    voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
    voiceStreamRef.current = null;
  }

  function clearVoiceTimer() {
    if (voiceTimerRef.current !== null) {
      window.clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (voiceDeadlineRef.current !== null) {
      window.clearTimeout(voiceDeadlineRef.current);
      voiceDeadlineRef.current = null;
    }
  }

  function cancelVoiceCapture(clearTranscript = false) {
    const ownsComposerTranscript = voiceTranscriptOwnedRef.current;
    voiceSessionRef.current += 1;
    voiceAbortRef.current?.abort();
    voiceAbortRef.current = null;
    clearVoiceTimer();

    const recorder = voiceRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      recorder.stop();
    }
    voiceRecorderRef.current = null;
    stopVoiceTracks();
    voiceChunksRef.current = [];
    setVoiceState("idle");
    setVoiceElapsed(0);
    voiceTranscriptOwnedRef.current = false;
    if (clearTranscript && ownsComposerTranscript) setMessage("");
  }

  async function transcribeRecordedVoice(
    sessionId: number,
    recordThreadId: string,
    mimeType: string,
  ) {
    clearVoiceTimer();
    stopVoiceTracks();
    voiceRecorderRef.current = null;

    if (sessionId !== voiceSessionRef.current) return;

    const chunks = voiceChunksRef.current;
    voiceChunksRef.current = [];
    const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
    if (!blob.size) {
      setVoiceState("idle");
      setError(describe(new ApiError(0, "STT_EMPTY_AUDIO")));
      return;
    }

    setVoiceState("transcribing");
    setNotice("");
    const controller = new AbortController();
    voiceAbortRef.current = controller;
    try {
      const result = await transcribeVoice(
        recordThreadId,
        blob,
        "auto",
        controller.signal,
      );
      if (
        sessionId !== voiceSessionRef.current ||
        recordThreadId !== activeThreadRef.current
      ) {
        return;
      }
      voiceTranscriptOwnedRef.current = true;
      setMessage(result.transcript);
      setVoiceState("review");
      setNotice("Transcrição pronta. Revise o texto antes de enviar.");
    } catch (err) {
      if (sessionId !== voiceSessionRef.current) return;
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError(describe(err));
      }
      setVoiceState("idle");
    } finally {
      if (sessionId === voiceSessionRef.current) {
        voiceAbortRef.current = null;
      }
    }
  }

  async function startVoiceRecording() {
    if (!requireAuthenticated()) return;
    if (!threadId) {
      setError("Crie ou selecione uma conversa antes de gravar.");
      return;
    }
    if (
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("Este navegador não oferece gravação de voz compatível.");
      return;
    }

    setError("");
    setNotice("");
    const sessionId = voiceSessionRef.current + 1;
    voiceSessionRef.current = sessionId;
    const recordThreadId = threadId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sessionId !== voiceSessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const mimeType =
        typeof MediaRecorder.isTypeSupported === "function"
          ? candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate))
          : undefined;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      voiceStreamRef.current = stream;
      voiceRecorderRef.current = recorder;
      voiceChunksRef.current = [];
      setVoiceElapsed(0);

      recorder.ondataavailable = (event) => {
        if (sessionId === voiceSessionRef.current && event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        if (sessionId !== voiceSessionRef.current) return;
        setError("A gravação de voz foi interrompida.");
        cancelVoiceCapture();
      };
      recorder.onstop = () => {
        void transcribeRecordedVoice(
          sessionId,
          recordThreadId,
          recorder.mimeType || mimeType || "audio/webm",
        );
      };

      recorder.start(250);
      setVoiceState("recording");
      voiceTimerRef.current = window.setInterval(
        () =>
          setVoiceElapsed((current) =>
            Math.min(current + 1, VOICE_MAX_RECORDING_SECONDS),
          ),
        1000,
      );
      voiceDeadlineRef.current = window.setTimeout(() => {
        if (sessionId !== voiceSessionRef.current) return;
        const activeRecorder = voiceRecorderRef.current;
        if (!activeRecorder || activeRecorder.state === "inactive") return;
        setNotice(
          `Limite de ${VOICE_MAX_RECORDING_SECONDS}s atingido. Transcrevendo…`,
        );
        clearVoiceTimer();
        activeRecorder.stop();
      }, VOICE_MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      cancelVoiceCapture();
      const name =
        err && typeof err === "object" && "name" in err
          ? String((err as { name?: unknown }).name || "")
          : "";
      setError(
        name === "NotAllowedError"
          ? "Permissão do microfone negada."
          : "Não foi possível iniciar o microfone.",
      );
    }
  }

  function stopVoiceRecording() {
    const recorder = voiceRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    clearVoiceTimer();
    recorder.stop();
  }

  function handleVoiceButton() {
    if (voiceState === "recording") {
      stopVoiceRecording();
      return;
    }
    if (voiceState === "transcribing") return;
    void startVoiceRecording();
  }

  async function handleNewThread() {
    if (!requireAuthenticated()) return;
    if (!configured) {
      setError(describe("API_BASE_URL_NOT_CONFIGURED"));
      return;
    }
    setError("");
    try {
      const created = await createThread();
      await refreshThreads();
      selectThread(created.id);
      setNotice("Conversa criada.");
    } catch (err) {
      setError(describe(err));
    }
  }

  async function handleSend() {
    const content = message.trim();
    if (
      !content ||
      sending ||
      voiceState === "recording" ||
      voiceState === "transcribing"
    )
      return;
    if (!requireAuthenticated()) return;
    if (!threadId) {
      setError("Crie ou selecione uma conversa antes de enviar.");
      return;
    }

    setError("");
    setNotice("");
    setSending(true);
    setStreamingText("");
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      author_type: "user",
      agent_name: null,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setMessage("");
    if (voiceState === "review") {
      voiceTranscriptOwnedRef.current = false;
      setVoiceState("idle");
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamMessage(
        threadId,
        content,
        selectedAgent ? technicalAgentTarget(selectedAgent.slug) : "Josué",
        {
          onChunk: (text) => setStreamingText((current) => current + text),
          onError: (code) => setError(describe(new ApiError(0, code))),
          onDone: (data) => {
            const artifact = parseArtifactMetadata(data);
            if (data.artifact !== undefined && !artifact) {
              setError(describe(new ApiError(0, "ARTIFACT_METADATA_INVALID")));
            }
            if (artifact) {
              setArtifacts((current) => [
                ...current.filter(
                  (item) => item.artifact_id !== artifact.artifact_id,
                ),
                artifact,
              ]);
            }
            setStreamingText("");
            void refreshMessages();
          },
        },
        controller.signal,
      );
    } catch (err) {
      setError(describe(err));
    } finally {
      abortRef.current = null;
      setSending(false);
      setStreamingText("");
    }
  }

  async function handleArtifactDownload(artifact: ArtifactMetadata) {
    if (!requireAuthenticated()) return;
    setArtifactDownloadBusy(artifact.artifact_id);
    setArtifactDownloadErrors((current) => ({
      ...current,
      [artifact.artifact_id]: "",
    }));
    try {
      await downloadArtifact(artifact);
      setNotice(`Download iniciado: ${artifact.filename}`);
    } catch (err) {
      setArtifactDownloadErrors((current) => ({
        ...current,
        [artifact.artifact_id]: describe(err),
      }));
    } finally {
      setArtifactDownloadBusy("");
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!requireAuthenticated()) return;
    if (!threadId) {
      setError("Crie ou selecione uma conversa antes de anexar.");
      return;
    }
    setError("");
    setNotice("");
    setUploading(true);
    try {
      const uploaded = await uploadAttachment(threadId, file);
      setRecentAttachment(uploaded.filename);
      setNotice(`Anexo enviado: ${uploaded.filename}`);
    } catch (err) {
      setError(describe(err));
    } finally {
      setUploading(false);
    }
  }

  async function invite() {
    if (!requireAuthenticated()) {
      setInviteError(
        authConfigured
          ? "Autentique-se para convidar participantes."
          : "A autenticação OIDC ainda não está configurada.",
      );
      return;
    }
    if (!threadId) {
      setInviteError("Crie ou selecione uma conversa antes de convidar.");
      return;
    }
    setInviteError("");
    setInviteUrl("");
    setInviteBusy(true);
    try {
      const out = await createInvite(threadId, {
        email,
        role: "participant",
        history_access: "from_join",
      });
      setInviteUrl(out.invitation_url);
    } catch (err) {
      setInviteError(describe(err));
    } finally {
      setInviteBusy(false);
    }
  }

  const activeThread = threads.find((thread) => thread.id === threadId) ?? null;
  const selectedAgentName =
    selectedAgent?.canonical_name || selectedAgent?.display_name || AGENT;
  const selectedAgentRole =
    selectedAgent?.localized_role_labels?.["pt-BR"] ||
    selectedAgent?.role_label ||
    "Agente selecionado";
  const selectedAgentInitial = selectedAgentName.slice(0, 1).toUpperCase();

  return (
    <div className="console-shell">
      <aside
        className={showMobileSidebar ? "console-sidebar console-sidebar--open" : "console-sidebar"}
        aria-label="Navegação do console"
      >
        <div className="console-sidebar__brand">
          <Link className="brand-lockup brand-lockup--compact" to="/">
            <span className="brand-orb" aria-hidden="true" />
            <span>ORKIO™</span>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setShowMobileSidebar(false)}
            aria-label="Fechar conversas"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={handleNewThread}
          disabled={!authenticated || !configured}
        >
          + Nova conversa
        </button>
        <nav className="conversation-nav" aria-label="Conversas">
          <div className="conversation-nav__heading">
            <strong>Conversas</strong>
            <span>{threads.length}</span>
          </div>
          {threads.length === 0 ? (
            <span>Nenhuma conversa selecionada</span>
          ) : (
            <ul className="conversation-list">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={
                      thread.id === threadId
                        ? "conversation-item conversation-item--active"
                        : "conversation-item"
                    }
                    aria-current={thread.id === threadId ? "true" : undefined}
                    onClick={() => selectThread(thread.id)}
                  >
                    <span className="conversation-item__title">
                      {thread.title || "Nova conversa"}
                    </span>
                    <time
                      className="conversation-item__time"
                      dateTime={thread.created_at}
                      title={formatDateTimeTitle(thread.created_at)}
                    >
                      {formatConversationTimestamp(thread.created_at)}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <PwaInstallButton compact />
      </aside>
      {showMobileSidebar ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar conversas"
          onClick={() => setShowMobileSidebar(false)}
        />
      ) : null}

      <main id="main-content" className="console-main">
        <header className="console-header">
          <div className="console-header__context">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setShowMobileSidebar(true)}
              aria-label="Abrir conversas"
              aria-expanded={showMobileSidebar}
            >
              ☰
            </button>
            <div>
              <span className="console-header__eyebrow">Conversa ativa</span>
              <b>{activeThread?.title || "ORKIO Command Center"}</b>
              <small>
                {activeThread
                  ? formatDateTimeTitle(activeThread.created_at)
                  : "Collaborative Intelligence"}
              </small>
            </div>
          </div>
          <div className="console-header__actions">
            <button
              type="button"
              className="active-agent-chip"
              onClick={() => setShowAgents(true)}
              disabled={!authenticated}
              aria-label={`Agente ativo: ${selectedAgentName}`}
              title="Selecionar agente"
            >
              <span className="active-agent-chip__avatar" aria-hidden="true">
                {selectedAgentInitial}
              </span>
              <span className="active-agent-chip__copy">
                <strong>{selectedAgentName}</strong>
                <small>{selectedAgentRole}</small>
              </span>
            </button>
            <Link className="ghost-link" to="/">
              Início
            </Link>
            {authConfigured ? (
              authenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setAuthenticated(false);
                  }}
                >
                  Sair
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void beginLogin(
                      `${window.location.pathname}${window.location.search}`,
                    )
                  }
                >
                  Entrar
                </button>
              )
            ) : null}
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              disabled={!authenticated}
            >
              + Convidar
            </button>
          </div>
        </header>

        {!authenticated ? (
          <div className="console-alert" role="alert">
            <span>
              {authConfigured
                ? "Autentique-se para usar conversas, anexos e convites."
                : "A autenticação OIDC ainda não está configurada nesta implantação."}
            </span>
            {authConfigured ? (
              <button type="button" onClick={() => void beginLogin("/app")}>
                Entrar
              </button>
            ) : null}
          </div>
        ) : null}
        {!configured ? (
          <p className="console-alert" role="alert">
            A URL da API não está configurada nesta implantação.
          </p>
        ) : null}
        {error ? (
          <p className="console-alert" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="console-notice" role="status">
            {notice}
          </p>
        ) : null}

        <section
          className="thread"
          aria-label="Conversa"
          aria-busy={loading || sending}
        >
          {loading && messages.length === 0 ? (
            <div className="thread-state" role="status">
              <span className="thread-state__pulse" aria-hidden="true" />
              Carregando conversa…
            </div>
          ) : messages.length === 0 && !streamingText ? (
            <article className="message agent message--welcome">
              <header className="message__meta">
                <span className="message__author">{selectedAgentName}</span>
                <span>Pronto para conversar</span>
              </header>
              <p>Onde a inteligência encontra harmonia.</p>
            </article>
          ) : (
            messages.map((item) => (
              <article
                key={item.id}
                className={item.author_type === "agent" ? "message agent" : "message user"}
              >
                <header className="message__meta">
                  <span className="message__author">
                    {item.author_type === "agent" ? item.agent_name || AGENT : "Você"}
                  </span>
                  <time
                    dateTime={item.created_at}
                    title={formatDateTimeTitle(item.created_at)}
                  >
                    {formatMessageTimestamp(item.created_at)}
                  </time>
                </header>
                <p>{item.content}</p>
              </article>
            ))
          )}
          {streamingText ? (
            <article className="message agent message--streaming" aria-live="polite">
              <header className="message__meta">
                <span className="message__author">
                  {selectedAgent?.display_name || AGENT}
                </span>
                <span className="streaming-status">
                  <span className="streaming-status__dot" aria-hidden="true" />
                  Gerando
                </span>
              </header>
              <p>{streamingText}</p>
            </article>
          ) : null}
        </section>

        {artifacts.length > 0 ? (
          <section
            className="artifact-delivery"
            aria-label="Arquivos gerados nesta sessão"
            aria-live="polite"
          >
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.artifact_id}
                artifact={artifact}
                busy={artifactDownloadBusy === artifact.artifact_id}
                error={artifactDownloadErrors[artifact.artifact_id] || ""}
                onDownload={(item) => void handleArtifactDownload(item)}
              />
            ))}
          </section>
        ) : null}

        <footer className="composer">
          <div className="composer__status" aria-live="polite">
            <span>
              {sending
                ? `Gerando resposta com ${selectedAgentName}…`
                : voiceState === "recording"
                  ? `Gravando ${formatVoiceElapsed(voiceElapsed)} · máx. ${formatVoiceElapsed(VOICE_MAX_RECORDING_SECONDS)}`
                  : voiceState === "transcribing"
                    ? "Transcrevendo voz…"
                    : voiceState === "review"
                      ? "Transcrição pronta — revise e envie."
                      : uploading
                        ? "Enviando anexo…"
                        : recentAttachment
                          ? `Anexo no contexto: ${recentAttachment}`
                          : "Enter para enviar · Shift+Enter para nova linha"}
            </span>
            <span className="composer__agent">
              {selectedAgentName} · {selectedAgentRole}
            </span>
          </div>
          <div className="composer__row">
          <label className="icon-button" aria-label="Anexar arquivo">
            <span aria-hidden="true">📎</span>
            <input
              type="file"
              hidden
              ref={fileRef}
              onChange={handleFile}
              disabled={!authenticated || sending || uploading}
            />
          </label>
          <button
            type="button"
            className="agent-trigger"
            onClick={() => setShowAgents(true)}
            aria-label="Selecionar agente"
            aria-haspopup="dialog"
            disabled={!authenticated}
            title="Selecionar agente"
          >
            <span aria-hidden="true">👥</span>
            <span className="agent-trigger__label">
              {selectedAgentName || "Agentes"}
            </span>
          </button>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Digite sua mensagem."
            aria-label="Mensagem"
            disabled={
              sending ||
              !authenticated ||
              voiceState === "recording" ||
              voiceState === "transcribing"
            }
          />
          <button
            type="button"
            className={
              voiceState === "recording"
                ? "icon-button voice-button voice-button--recording"
                : "icon-button voice-button"
            }
            aria-label={
              voiceState === "recording" ? "Parar gravação" : "Gravar voz"
            }
            title={
              voiceState === "recording"
                ? "Parar e transcrever"
                : voiceState === "review"
                  ? "Gravar novamente"
                  : `Gravar mensagem de voz (máx. ${VOICE_MAX_RECORDING_SECONDS}s)`
            }
            onClick={handleVoiceButton}
            disabled={
              !authenticated ||
              !configured ||
              !threadId ||
              sending ||
              uploading ||
              voiceState === "transcribing"
            }
            aria-pressed={voiceState === "recording"}
          >
            {voiceState === "recording" ? "■" : "🎙"}
          </button>
          {voiceState === "review" ? (
            <button
              type="button"
              className="voice-review__discard"
              onClick={() => cancelVoiceCapture(true)}
              disabled={sending}
            >
              Descartar
            </button>
          ) : null}
          <button
            type="button"
            className="primary-button composer__send"
            onClick={handleSend}
            disabled={
              sending ||
              !message.trim() ||
              !authenticated ||
              !configured ||
              voiceState === "recording" ||
              voiceState === "transcribing"
            }
          >
            {sending ? "Gerando…" : "Enviar"}
          </button>
          </div>
        </footer>
      </main>



      {showAgents ? (
        <div className="modal" role="presentation">
          <section
            className="modal-card agent-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-picker-title"
          >
            <div className="agent-picker__heading">
              <div>
                <h2 id="agent-picker-title">Inteligência colaborativa</h2>
                <p>Escolha o especialista que será solicitado para o próximo turno.</p>
              </div>
              <button type="button" onClick={() => setShowAgents(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="agent-mode" aria-label="Modo de execução">
              <button type="button" className="agent-mode__active" aria-pressed="true">
                Individual
              </button>
              <button
                type="button"
                disabled
                title="Modo Team depende do contrato backend governado."
              >
                Team · em breve
              </button>
            </div>

            {agentsBusy ? <p role="status">Carregando Agent Registry…</p> : null}
            {agentsError ? (
              <div className="console-alert" role="alert">
                <span>{agentsError}</span>
                <button type="button" onClick={() => void refreshAgents()}>
                  Tentar novamente
                </button>
              </div>
            ) : null}
            {!agentsBusy && !agentsError && agents.length === 0 ? (
              <p className="agent-picker__empty">Nenhum agente disponível no Registry.</p>
            ) : null}

            <div className="agent-grid" role="list" aria-label="Agentes disponíveis">
              {agents.map((agent) => {
                const active = selectedAgent?.slug === agent.slug;
                return (
                  <button
                    type="button"
                    role="listitem"
                    key={agent.slug}
                    className={active ? "agent-card agent-card--active" : "agent-card"}
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowAgents(false);
                      setNotice(`Agente selecionado: ${agent.display_name}`);
                    }}
                  >
                    <span className="agent-card__avatar" aria-hidden="true">
                      {agent.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <strong>{agent.display_name}</strong>
                      <small>{agent.target_kind === "agent" ? "Agente especializado" : agent.target_kind}</small>
                    </span>
                    <span className="agent-card__status">{active ? "Ativo" : "Disponível"}</span>
                  </button>
                );
              })}
            </div>

            <p className="agent-picker__governance">
              O executor real é resolvido pelo backend. A interface não substitui a identidade de execução.
            </p>
          </section>
        </div>
      ) : null}
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
              Função: Participante · Histórico: a partir da entrada · Validade: 72
              horas
            </p>
            {inviteError ? (
              <p className="console-alert" role="alert">
                {inviteError}
              </p>
            ) : null}
            {inviteUrl ? <output>{inviteUrl}</output> : null}
            <div className="modal-card__actions">
              <button type="button" onClick={() => setShowInvite(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={invite}
                disabled={inviteBusy || !authenticated}
              >
                {inviteBusy ? "Gerando." : "Gerar convite"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
