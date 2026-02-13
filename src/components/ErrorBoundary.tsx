import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
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
                <div className="min-h-screen bg-black text-white p-8 font-mono flex flex-col items-center justify-center">
                    <h1 className="text-2xl text-red-500 mb-4 font-bold">Runtime Error Detected!</h1>
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl max-w-4xl overflow-auto">
                        <p className="text-[#ADFF44] mb-4 text-lg">{this.state.error?.message}</p>
                        <pre className="text-xs text-neutral-500 whitespace-pre-wrap">
                            {this.state.error?.stack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-[#ADFF44] text-black font-bold rounded-lg"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
