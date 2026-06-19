"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside UniGames boundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 text-white text-center">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-danger/10 border border-danger/30 text-red-500 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-outfit font-bold text-base uppercase tracking-wide">Interface Crash Detected</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-2">
                A component failed to render correctly. Please retry loading the module.
              </p>
              {this.state.error && (
                <div className="text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono text-slate-500 truncate max-w-xs mx-auto mt-2">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <Button
              onClick={this.handleRetry}
              variant="primary"
              size="sm"
              className="w-full py-2 h-10 font-outfit uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-tactile transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Retry Loading
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
