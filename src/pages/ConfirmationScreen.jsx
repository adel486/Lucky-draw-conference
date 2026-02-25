import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const ConfirmationScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const name = location.state?.name || "Participant";

    useEffect(() => {
        // Fire confetti on mount
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    return (
        <div className="page-container">
            <div className="bg-flare glow-top-right"></div>

            <div className="glass-panel" style={{ padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem)', maxWidth: 'min(90vw, 500px)', width: '100%', textAlign: 'center' }}>
                <div className="animate-float" style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle size={60} color="#4CAF50" style={{ filter: 'drop-shadow(0 0 15px rgba(76, 175, 80, 0.4))' }} />
                </div>

                <h2 className="gold-text" style={{ fontSize: 'clamp(1.8rem, 7vw, 2.5rem)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }}>
                    You're In, {name}!
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)', lineHeight: '1.6' }}>
                    Your entry has been successfully recorded. Stay tuned for the lucky draw announcement!
                </p>

                <button
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                    style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', padding: 'clamp(10px, 3vw, 12px) clamp(20px, 6vw, 24px)' }}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default ConfirmationScreen;
