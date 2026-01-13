import React from 'react';

export const LoadingBar: React.FC = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '40px'
        }}>
            <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: '#e2e8f0',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div className="loading-bar-progress" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: 'var(--primary-color)',
                    width: '50%',
                    animation: 'indeterminate 1.5s infinite ease-in-out'
                }} />
            </div>
            <p style={{
                marginTop: '16px',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
            }}>
                Analyzing live system performance data...
            </p>
            <style>{`
                @keyframes indeterminate {
                    0% {
                        left: -50%;
                        width: 50%;
                    }
                    50% {
                        left: 25%;
                        width: 75%;
                    }
                    100% {
                        left: 100%;
                        width: 50%;
                    }
                }
            `}</style>
        </div>
    );
};
