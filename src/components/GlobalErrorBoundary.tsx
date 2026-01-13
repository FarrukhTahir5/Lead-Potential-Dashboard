import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fff0f0', minHeight: '100vh', color: '#333' }}>
                    <h1 style={{ color: '#d32f2f' }}>Something went wrong.</h1>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>Error Details:</h3>
                        <pre style={{ color: '#d32f2f', overflowX: 'auto' }}>
                            {this.state.error?.toString()}
                        </pre>
                        <details style={{ marginTop: '20px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Stack Trace</summary>
                            <pre style={{ fontSize: '12px', marginTop: '10px', overflowX: 'auto' }}>
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
