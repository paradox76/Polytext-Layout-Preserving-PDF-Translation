
import { CSSProperties } from 'react';

interface LoaderProps {
    variant: 'overlay' | 'inline';
    show: boolean;
}

export default function Loader({ variant, show }: LoaderProps) {
    if (!show) return null;

    if (variant === 'overlay') {
        const overlayStyle: CSSProperties = {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
        };

        return (
            <div style={overlayStyle}>
                <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    );
}