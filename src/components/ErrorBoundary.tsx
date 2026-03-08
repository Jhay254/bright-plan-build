import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);

    // Auto-reload on stale dynamic import failures (happens after redeployment)
    if (
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed")
    ) {
      window.location.reload();
      return;
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-14 h-14 rounded-full bg-ember/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-ember" />
            </div>
            <h2 className="font-heading text-xl font-bold text-bark mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-driftwood mb-6">
              An unexpected error occurred. Try refreshing or going back.
            </p>
            {this.state.error && (
              <p className="text-xs text-driftwood/60 bg-sand rounded-echo-md p-3 mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" /> Try Again
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/app";
                }}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
