import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-xl p-8 border border-red-900/20">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-thin text-red-500">Something went wrong</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-red-300/70">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              
              <div className="bg-black/30 p-4 border border-red-900/20 font-mono text-sm text-red-300/50 break-all">
                {this.state.error?.message}
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600/20 border border-red-600/50 text-red-500 hover:border-red-600 hover:text-red-600 transition-all duration-300 py-3 font-mono uppercase tracking-wider text-sm"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;