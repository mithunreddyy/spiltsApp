"use client";

import { AlertTriangle, Home, RefreshCw, Sparkles } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 bg-grid-white dark:bg-grid-dark opacity-10" />
          <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-red-200/20 dark:bg-red-500/10 rounded-full blur-3xl animate-float" />
          <div
            className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />

          <div className="max-w-2xl w-full relative z-10">
            <div className="glass-panel p-8 text-center animate-scale-in">
              <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 dark:bg-red-500/20 rounded-2xl mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Oops! Something went wrong
                </h1>
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is
                safe and secure.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-8 glass-card p-6 rounded-2xl border border-red-500/20 text-left">
                  <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all mb-4">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-sm">
                      <summary className="text-red-600 dark:text-red-400 cursor-pointer font-medium mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-xs mt-3 overflow-auto max-h-48 text-red-600 dark:text-red-400 bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={this.handleReset}
                  className="glass-button-primary py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="glass-button py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="glass-button py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                If this problem persists, try clearing your browser cache or
                contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
