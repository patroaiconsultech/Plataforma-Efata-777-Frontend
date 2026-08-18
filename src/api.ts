import { publicEnv } from "./config/runtime";

const BASE = publicEnv("VITE_API_BASE_URL").replace(/\/$/, "");

export const TOKEN_STORAGE_KEY = "orkio_access_token";
export const TOKEN_EXPIRY_STORAGE_KEY = "orkio_access_token_expires_at";
export const AUTH_REQUIRED_EVENT = "orkio:auth-required";

/** Erro de API com status e código legível, em vez de string concatenada. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiBaseConfigured(): boolean {
  return BASE.length > 0;
}

export function getToken(): string | null {
  try {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const expiresAt = Number(
      sessionStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY) || "0",
    );
    if (token && expiresAt > 0 && Date.now() >= expiresAt) {
      clearToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setToken(token: string, expiresInSeconds?: number): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (
      typeof expiresInSeconds === "number" &&
      Number.isFinite(expiresInSeconds) &&
      expiresInSeconds > 0
    ) {
      sessionStorage.setItem(
        TOKEN_EXPIRY_STORAGE_KEY,
        String(Date.now() + expiresInSeconds * 1000),
      );
    } else {
      sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    }
  } catch {
    /* armazenamento indisponível: a sessão apenas não persiste */
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
    }
  } catch {
    /* nada a fazer */
  }
}

function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

/** Extrai o código de erro do corpo, aceitando JSON ou texto. */
async function readError(response: Response): Promise<ApiError> {
  const raw = await response.text();
  let code = raw || `HTTP_${response.status}`;
  try {
    const parsed = JSON.parse(raw);
    const detail = parsed?.detail ?? parsed?.code ?? parsed?.message;
    if (typeof detail === "string") code = detail;
    else if (detail && typeof detail === "object")
      code = detail.code || detail.status || code;
  } catch {
    /* corpo não é JSON: mantém o texto */
  }
  if (response.status === 401) clearToken();
  return new ApiError(response.status, String(code).slice(0, 200));
}

function ensureConfigured(): void {
  if (!BASE)
    throw new ApiError(
      0,
      "API_BASE_URL_NOT_CONFIGURED",
      "VITE_API_BASE_URL não está configurada nesta implantação.",
    );
}

/** Requisição JSON. Só define Content-Type quando há corpo. */
export async function apiJson<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  ensureConfigured();
  const headers = authHeaders(init.headers);
  if (init.body !== undefined && init.body !== null)
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * Requisição multipart. Nunca define Content-Type manualmente: o
 * navegador precisa gerar o boundary.
 */
export async function apiForm<T = unknown>(
  path: string,
  form: FormData,
  init: RequestInit = {},
): Promise<T> {
  ensureConfigured();
  const headers = authHeaders(init.headers);
  headers.delete("Content-Type");
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    method: init.method || "POST",
    body: form,
    headers,
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}



export type AgentDefinition = {
  slug: string;
  display_name: string;
  target_kind: "agent" | string;
  canonical_name?: string;
  role_code?: string;
  role_label?: string;
  organizational_level?: string;
  department?: string;
  founder_direct_access?: boolean;
  localized_names?: Record<string, string>;
  localized_role_labels?: Record<string, string>;
  availability?: {
    registered?: boolean;
    configured?: boolean;
    ready?: boolean;
    state?: string;
    reason?: string | null;
    chat?: CapabilityAvailability;
    team?: CapabilityAvailability;
    realtime?: CapabilityAvailability;
    voice_playback?: CapabilityAvailability;
    voice_message?: CapabilityAvailability;
    tools?: CapabilityAvailability;
  };
};

export type CapabilityAvailability = {
  status?: string;
  eligible?: boolean;
  reason_code?: string;
  source?: string;
};

export function listAgents(): Promise<AgentDefinition[]> {
  return apiJson<AgentDefinition[]>("/api/v2/agents");
}

export type TeamParticipantPolicy = {
  min_contributors: number;
  max_contributors: number;
  eligible_count: number;
  select_all_supported: boolean;
};

export type TeamDefinition = {
  team_id: string;
  display_name: string;
  orchestrator_agent_id: string;
  candidate_contributor_agent_ids: string[];
  participant_policy: TeamParticipantPolicy;
  /** rolling-deploy compatibility; new UI uses contributor field */
  candidate_agent_ids?: string[];
  max_delegation_depth: number;
  enabled: boolean;
};

export function listTeams(): Promise<TeamDefinition[]> {
  return apiJson<TeamDefinition[]>("/api/v2/teams");
}

export type RealtimeCapabilityItem = {
  status?: string;
  eligible?: boolean;
  reason_code?: string;
};

export type RealtimeCapabilities = {
  text_streaming?: RealtimeCapabilityItem;
  streaming?: RealtimeCapabilityItem;
  realtime_session?: RealtimeCapabilityItem;
  voice_input?: RealtimeCapabilityItem;
  voice_output?: RealtimeCapabilityItem;
  agent_voice_binding?: RealtimeCapabilityItem;
  interruption?: RealtimeCapabilityItem;
  turn_detection?: RealtimeCapabilityItem;
  orchestration_bridge?: RealtimeCapabilityItem;
  runtime_proven?: boolean;
};

export function getRealtimeCapabilities(): Promise<RealtimeCapabilities> {
  return apiJson<RealtimeCapabilities>("/api/v2/realtime/capabilities");
}

export type Thread = {
  id: string;
  title: string;
  created_at: string;
  thread_role: string;
};

export type ThreadList = {
  items: Thread[];
  total: number;
  limit: number;
  offset: number;
};

export type ChatMessage = {
  id: string;
  author_type: "user" | "agent";
  agent_id?: string | null;
  agent_name: string | null;
  content: string;
  created_at: string;
};

export function listThreads(limit = 50, offset = 0): Promise<ThreadList> {
  return apiJson<ThreadList>(`/api/v2/threads?limit=${limit}&offset=${offset}`);
}

export function createThread(title?: string): Promise<{ id: string; title: string }> {
  return apiJson(`/api/v2/threads`, {
    method: "POST",
    body: JSON.stringify(title ? { title } : {}),
  });
}

export function listMessages(threadId: string): Promise<ChatMessage[]> {
  return apiJson<ChatMessage[]>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/messages`,
  );
}

export function createInvite(threadId: string, payload: object) {
  return apiJson<{ invitation_id: string; invitation_url: string; expires_at: string }>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/invitations`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export function acceptInvite(token: string): Promise<{ status: string; thread_id: string }> {
  return apiJson(`/api/v2/invitations/accept`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function uploadAttachment(threadId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiForm<{ id: string; filename: string; sha256: string }>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/attachments`,
    form,
  );
}


export type DocumentSourceProvenance = {
  attachment_id: string;
  filename: string;
  extraction_status: string;
  source_chars: number;
  provided_chars: number;
  truncated: boolean;
};

export type DocumentContextProvenance = {
  available: boolean;
  sources: number;
  source_ids: string[];
  extraction_status: "ready" | "partial" | "failed" | "none" | string;
  source_chars: number;
  provided_chars: number;
  per_source_truncated: boolean;
  aggregate_truncated: boolean;
  truncated: boolean;
  context_version: string;
  source_provenance: DocumentSourceProvenance[];
};

export function getDocumentContextProvenance(
  threadId: string,
): Promise<DocumentContextProvenance> {
  return apiJson<DocumentContextProvenance>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/document-context`,
  );
}

export type MessageVoiceResult = {
  blob: Blob;
  agentId: string;
  bindingId: string;
  locale: string;
  cache: string;
};

export async function messageVoice(
  threadId: string,
  messageId: string,
  locale: "pt-BR" | "en-US" | "es-419" = "pt-BR",
  signal?: AbortSignal,
): Promise<MessageVoiceResult> {
  ensureConfigured();
  const headers = authHeaders();
  headers.set("Content-Type", "application/json");
  headers.set(
    "X-Request-Id",
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tts-${Date.now()}`,
  );
  const response = await fetch(
    `${BASE}/api/v2/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(messageId)}/voice`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ locale }),
      signal,
      cache: "no-store",
    },
  );
  if (!response.ok) throw await readError(response);
  return {
    blob: await response.blob(),
    agentId: response.headers.get("X-Orkio-Voice-Agent-Id") || "",
    bindingId: response.headers.get("X-Orkio-Voice-Binding-Id") || "",
    locale: response.headers.get("X-Orkio-Voice-Locale") || locale,
    cache: response.headers.get("X-Orkio-TTS-Cache") || "",
  };
}

export type RealtimeCallRequest = {
  sdp: string;
  target_mode: "direct" | "team";
  agent?: string;
  team_id?: string;
  selection_mode?: "explicit" | "all_eligible";
  contributor_agent_ids?: string[];
  locale: "pt-BR" | "en-US" | "es-419";
};

export type RealtimeCall = {
  sdp: string;
  call_id: string | null;
  session_id: string;
  execution_id: string;
  agent_id: string;
  agent_name: string;
  ownership_locked: boolean;
  target_mode: "direct" | "team";
  orchestration_bridge: true;
};

export function createRealtimeCall(
  threadId: string,
  payload: RealtimeCallRequest,
): Promise<RealtimeCall> {
  return apiJson<RealtimeCall>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/realtime/calls`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export type RealtimeTurnResult = {
  status: "completed";
  reconciled: boolean;
  terminal_event: "done";
  message_id: string;
  execution_id: string;
  agent_id: string;
  agent_name?: string;
  target_mode?: "direct" | "team";
  content: string;
  tts_path?: string;
};

export function commitRealtimeTurn(
  threadId: string,
  payload: {
    session_id: string;
    provider_item_id: string;
    transcript_final_id: string;
    transcript: string;
  },
): Promise<RealtimeTurnResult> {
  return apiJson<RealtimeTurnResult>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/realtime/turns`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export type VoiceTranscript = {
  transcript: string;
  locale_requested: string;
  language_detected: string | null;
  language_probability: number | null;
  engine: string;
  model: string;
  persisted: false;
};

export type VoiceLocale = "auto" | "pt-BR" | "en-US" | "es-419";

export function transcribeVoice(
  threadId: string,
  audio: Blob,
  locale: VoiceLocale = "auto",
  signal?: AbortSignal,
): Promise<VoiceTranscript> {
  const form = new FormData();
  const extension =
    audio.type.includes("ogg") ? "ogg" :
    audio.type.includes("wav") ? "wav" :
    audio.type.includes("mp4") ? "m4a" :
    audio.type.includes("mpeg") ? "mp3" :
    "webm";
  form.append("audio", audio, `voice-message.${extension}`);
  form.append("locale", locale);
  return apiForm<VoiceTranscript>(
    `/api/v2/threads/${encodeURIComponent(threadId)}/voice/transcribe`,
    form,
    { signal },
  );
}

export type ArtifactMetadata = {
  artifact_id: string;
  filename: string;
  mime_type: string;
  sha256: string;
  version: number;
  download_path: string;
  created_at: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validArtifactFilename(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 255 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("\0")
  );
}

function canonicalArtifactDownloadPath(artifactId: string): string {
  return `/api/v2/artifacts/${artifactId}/download`;
}

/**
 * Converte apenas metadata de artefato entregue pelo evento terminal `done`.
 * Texto do LLM nunca é usado como fonte de verdade para ArtifactCard.
 *
 * O backend atual emite `artifact.id`; `artifact_id` também é aceito como
 * compatibilidade explícita de contrato, mas o caminho precisa corresponder ao ID.
 */
export function parseArtifactMetadata(
  donePayload: Record<string, unknown>,
): ArtifactMetadata | null {
  if (donePayload.status !== "completed") return null;
  const raw = donePayload.artifact;
  if (!isRecord(raw)) return null;

  const rawId = raw.artifact_id ?? raw.id;
  if (typeof rawId !== "string" || !/^[A-Za-z0-9._:-]{1,160}$/.test(rawId))
    return null;
  if (!validArtifactFilename(raw.filename)) return null;
  if (
    typeof raw.mime_type !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9!#$&^_.+/-]{0,199}$/.test(raw.mime_type)
  )
    return null;
  if (typeof raw.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(raw.sha256))
    return null;
  if (
    typeof raw.version !== "number" ||
    !Number.isSafeInteger(raw.version) ||
    raw.version < 1
  )
    return null;
  if (
    typeof raw.download_path !== "string" ||
    raw.download_path !== canonicalArtifactDownloadPath(rawId)
  )
    return null;
  if (
    raw.created_at !== null &&
    raw.created_at !== undefined &&
    typeof raw.created_at !== "string"
  )
    return null;

  return {
    artifact_id: rawId,
    filename: raw.filename,
    mime_type: raw.mime_type,
    sha256: raw.sha256.toLowerCase(),
    version: raw.version,
    download_path: raw.download_path,
    created_at: typeof raw.created_at === "string" ? raw.created_at : null,
  };
}

/**
 * Download autenticado: token somente no cabeçalho Authorization.
 * O caminho vem de metadata terminal validada e nunca aceita URL externa.
 */
export async function downloadArtifact(artifact: ArtifactMetadata): Promise<void> {
  ensureConfigured();
  if (
    artifact.download_path !==
    canonicalArtifactDownloadPath(artifact.artifact_id)
  )
    throw new ApiError(0, "ARTIFACT_DOWNLOAD_PATH_INVALID");

  const headers = authHeaders({ Accept: artifact.mime_type });
  const response = await fetch(`${BASE}${artifact.download_path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!response.ok) throw await readError(response);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  try {
    anchor.href = objectUrl;
    anchor.download = artifact.filename;
    anchor.rel = "noopener";
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }
}

export function technicalAgentTarget(agentId: string): string {
  const normalized = agentId.trim();
  if (!normalized) throw new Error("AGENT_ID_REQUIRED");
  if (normalized.startsWith("id:")) return normalized;
  return `id:${normalized}`;
}

export type StreamHandlers = {
  onStatus?: (data: Record<string, unknown>) => void;
  onChunk?: (text: string) => void;
  onAgentStarted?: (data: Record<string, unknown>) => void;
  onAgentChunk?: (data: Record<string, unknown>) => void;
  onAgentDone?: (data: Record<string, unknown>) => void;
  onError?: (code: string) => void;
  onDone?: (data: Record<string, unknown>) => void;
};

/**
 * Consome SSE por fetch, em vez de EventSource, porque o endpoint é POST
 * e exige cabeçalho Authorization.
 *
 * Garante terminal: onDone é sempre invocado, inclusive em falha de rede
 * ou quando o servidor encerra sem enviar done, para que a interface nunca
 * fique travada.
 */
export async function streamMessage(
  threadId: string,
  content: string,
  agent: string,
  handlers: StreamHandlers = {},
  signal?: AbortSignal,
): Promise<void> {
  let terminated = false;
  const finish = (data: Record<string, unknown>) => {
    if (terminated) return;
    terminated = true;
    handlers.onDone?.(data);
  };

  try {
    ensureConfigured();
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "text/event-stream");
    const response = await fetch(
      `${BASE}/api/v2/threads/${encodeURIComponent(threadId)}/stream`,
      { method: "POST", headers, body: JSON.stringify({ content, agent }), signal },
    );
    if (!response.ok) {
      const error = await readError(response);
      handlers.onError?.(error.code);
      finish({ status: "failed" });
      return;
    }
    if (!response.body) {
      handlers.onError?.("STREAM_BODY_UNAVAILABLE");
      finish({ status: "failed" });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separator = buffer.indexOf("\n\n");
      while (separator !== -1) {
        const block = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        separator = buffer.indexOf("\n\n");
        let event = "message";
        const dataLines: string[] = [];
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (!dataLines.length) continue;
        let payload: Record<string, unknown> = {};
        try {
          payload = JSON.parse(dataLines.join("\n"));
        } catch {
          payload = { raw: dataLines.join("\n") };
        }
        if (event === "status") handlers.onStatus?.(payload);
        else if (event === "chunk") handlers.onChunk?.(String(payload.text ?? ""));
        else if (event === "agent_started") handlers.onAgentStarted?.(payload);
        else if (event === "agent_chunk") handlers.onAgentChunk?.(payload);
        else if (event === "agent_done") handlers.onAgentDone?.(payload);
        else if (event === "error")
          handlers.onError?.(String(payload.code ?? "STREAM_ERROR"));
        else if (event === "done") finish(payload);
      }
    }
    finish({ status: "closed" });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") {
      finish({ status: "aborted" });
      return;
    }
    handlers.onError?.(
      error instanceof ApiError ? error.code : "NETWORK_ERROR",
    );
    finish({ status: "failed" });
  } finally {
    finish({ status: "closed" });
  }
}


export type TeamStreamRequest = {
  team_id: string;
  selection_mode: "explicit" | "all_eligible";
  contributor_agent_ids?: string[];
};

export async function streamTeamMessage(
  threadId: string,
  content: string,
  team: TeamStreamRequest,
  handlers: StreamHandlers = {},
  signal?: AbortSignal,
): Promise<void> {
  let terminated = false;
  const finish = (data: Record<string, unknown>) => {
    if (terminated) return;
    terminated = true;
    handlers.onDone?.(data);
  };

  try {
    ensureConfigured();
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "text/event-stream");
    const response = await fetch(
      `${BASE}/api/v2/threads/${encodeURIComponent(threadId)}/team/stream`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ content, ...team }),
        signal,
      },
    );
    if (!response.ok) {
      const error = await readError(response);
      handlers.onError?.(error.code);
      finish({ status: "failed" });
      return;
    }
    if (!response.body) {
      handlers.onError?.("STREAM_BODY_UNAVAILABLE");
      finish({ status: "failed" });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separator = buffer.indexOf("\n\n");
      while (separator !== -1) {
        const block = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        separator = buffer.indexOf("\n\n");
        let event = "message";
        const dataLines: string[] = [];
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
        }
        if (!dataLines.length) continue;
        let payload: Record<string, unknown> = {};
        try {
          payload = JSON.parse(dataLines.join("\n"));
        } catch {
          payload = { raw: dataLines.join("\n") };
        }
        if (event === "status") handlers.onStatus?.(payload);
        else if (event === "chunk") handlers.onChunk?.(String(payload.text ?? ""));
        else if (event === "agent_started") handlers.onAgentStarted?.(payload);
        else if (event === "agent_chunk") handlers.onAgentChunk?.(payload);
        else if (event === "agent_done") handlers.onAgentDone?.(payload);
        else if (event === "error")
          handlers.onError?.(String(payload.code ?? "STREAM_ERROR"));
        else if (event === "done") finish(payload);
      }
    }
    finish({ status: "closed" });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") {
      finish({ status: "aborted" });
      return;
    }
    handlers.onError?.(
      error instanceof ApiError ? error.code : "NETWORK_ERROR",
    );
    finish({ status: "failed" });
  } finally {
    finish({ status: "closed" });
  }
}

/** Compatibilidade com o consumo anterior. */
export const api = apiJson;


export type HyperCocreatorMe = {
  user_id: string;
  tenant_id: string;
  email?: string | null;
  roles: string[];
  admin_access: boolean;
  co_creator_name: string;
  onboarding_goal?: string | null;
};

export type AccessGrantResponse = {
  grant: string;
  expires_at: number;
  onboarding_required: boolean;
};

export type AdminOverview = {
  tenant_id: string;
  users: number;
  threads: number;
  messages: number;
  co_creator_profiles: number;
  environment: string;
  release_sha: string;
};

export async function validateAccessCode(
  code: string,
): Promise<AccessGrantResponse> {
  return apiJson<AccessGrantResponse>("/api/v2/access/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function completeHyperCocreatorOnboarding(input: {
  grant: string;
  co_creator_name: string;
  onboarding_goal?: string | null;
}): Promise<{
  status: string;
  user_id: string;
  tenant_id: string;
  co_creator_name: string;
  onboarding_goal?: string | null;
}> {
  return apiJson("/api/v2/onboarding/complete", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<HyperCocreatorMe> {
  return apiJson<HyperCocreatorMe>("/api/v2/me");
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return apiJson<AdminOverview>("/api/v2/admin/overview");
}


export type AdminSecurityStatus = {
  auth_mode: string;
  demo_headers_enabled: boolean;
  github_read_only: boolean;
  evolution_execution_allowed: boolean;
  access_gate_enabled: boolean;
  access_gate_code_hash_count: number;
  access_gate_tenant_configured: boolean;
  access_gate_signing_secret_configured: boolean;
};

export async function updateCoCreatorName(
  co_creator_name: string,
): Promise<{
  status: string;
  co_creator_name: string;
  onboarding_goal?: string | null;
}> {
  return apiJson("/api/v2/me/co-creator", {
    method: "PATCH",
    body: JSON.stringify({ co_creator_name }),
  });
}

export async function getAdminSecurityStatus(): Promise<AdminSecurityStatus> {
  return apiJson<AdminSecurityStatus>("/api/v2/admin/security/status");
}
