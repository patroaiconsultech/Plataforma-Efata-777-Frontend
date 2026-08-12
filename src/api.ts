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
  };
};

export function listAgents(): Promise<AgentDefinition[]> {
  return apiJson<AgentDefinition[]>("/api/v2/agents");
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
