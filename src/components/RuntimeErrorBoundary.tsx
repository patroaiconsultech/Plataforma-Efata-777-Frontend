import { Component, type ErrorInfo, type ReactNode } from "react";

const RUNTIME_ERROR_EVENT = "patroai:runtime-error";

type RuntimeErrorBoundaryProps = {
  children: ReactNode;
};

type RuntimeErrorBoundaryState = {
  hasError: boolean;
};

type RuntimeErrorEventDetail = {
  source?: string;
  error?: unknown;
};

function isAbortError(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "name" in value &&
    String((value as { name?: unknown }).name || "") === "AbortError"
  );
}

export default class RuntimeErrorBoundary extends Component<
  RuntimeErrorBoundaryProps,
  RuntimeErrorBoundaryState
> {
  state: RuntimeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RuntimeErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PatroAI runtime error", error, info.componentStack);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
    window.addEventListener(RUNTIME_ERROR_EVENT, this.handleRuntimeError);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
    window.removeEventListener(RUNTIME_ERROR_EVENT, this.handleRuntimeError);
  }

  private trip = (error: unknown, source: string) => {
    if (this.state.hasError) return;
    console.error(`PatroAI ${source}`, error);
    this.setState((current) =>
      current.hasError ? null : { hasError: true },
    );
  };

  private handleGlobalError = (event: ErrorEvent) => {
    // Ignore asset loading errors; only JavaScript errors can invalidate React.
    if (!event.error && !event.message) return;
    this.trip(event.error || event.message, "global runtime error");
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // AbortController cancellation is an expected part of thread/session changes.
    if (isAbortError(event.reason)) return;
    this.trip(event.reason, "unhandled rejection");
  };

  private handleRuntimeError = (event: Event) => {
    const detail =
      event instanceof CustomEvent
        ? (event.detail as RuntimeErrorEventDetail | undefined)
        : undefined;
    this.trip(detail?.error ?? detail ?? event, detail?.source || "runtime event");
  };

  private recover = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="runtime-error-screen" role="alert" aria-live="assertive">
        <div className="runtime-error-card">
          <span className="runtime-error-card__eyebrow">PatroAI Command Center</span>
          <h1>Vamos retomar sua sessão.</h1>
          <p>
            Encontramos uma interrupção temporária ao carregar o console. Sua
            sessão não foi apagada. Tente recarregar a plataforma ou voltar ao
            portal de acesso.
          </p>
          <div className="runtime-error-card__actions">
            <button type="button" className="primary-button" onClick={this.recover}>
              Recarregar console
            </button>
            <a className="secondary-button" href="/access">
              Abrir portal de acesso
            </a>
            <a className="text-button" href="/">
              Voltar à página inicial
            </a>
          </div>
        </div>
      </main>
    );
  }
}
