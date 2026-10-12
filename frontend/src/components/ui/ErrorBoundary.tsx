import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121822] flex flex-col items-center justify-center p-8 text-center overflow-auto">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Dashboard Initialization Error</h1>
          <div className="bg-black/40 p-6 rounded-xl border border-red-500/20 max-w-4xl mb-6 text-left w-full">
            <p className="text-red-300 font-mono text-sm break-all mb-4">
              {this.state.error?.message || "Unknown runtime error"}
            </p>
            {this.state.error?.stack && (
              <pre className="text-[10px] text-text-secondary font-mono bg-black/20 p-4 rounded overflow-auto max-h-64">
                {this.state.error.stack}
              </pre>
            )}
          </div>
          <p className="text-text-secondary max-w-md">
            The security ecosystem visualization encountered a runtime issue. 
            Please provide the stack trace above to the engineering team.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 btn-primary"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
