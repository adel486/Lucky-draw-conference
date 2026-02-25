import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Gift } from 'lucide-react';
import logo from '../assets/logo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="bg-flare glow-top-right"></div>
            <div className="bg-flare glow-bottom-left"></div>

            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', maxWidth: 'min(90vw, 600px)', width: '100%', textAlign: 'center' }}>
                <div className="animate-float" style={{ marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
                    <img
                        src={logo}
                        alt="AI Conference 2026 Logo"
                        style={{
                            width: 'clamp(80px, 20vw, 120px)',
                            height: 'clamp(80px, 20vw, 120px)',
                            filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.5))',
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                </div>

                <h1 className="gold-text" style={{ fontSize: 'clamp(1.8rem, 8vw, 3rem)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)', lineHeight: '1.2' }}>
                    AI Conference 2026
                    <br />
                    Union Christian College
                    <br />
                    UCCIMT
                </h1>



                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'center' }}>
                    <button
                        className="btn-primary tooltip-container"
                        onClick={() => navigate('/register')}
                        style={{ width: '100%', maxWidth: 'clamp(250px, 80vw, 300px)' }}
                    >
                        <Sparkles size={20} />
                        Enter Lucky Draw Now
                    </button>

                    <div style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 2rem)', marginTop: 'clamp(1rem, 3vw, 2rem)', color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={18} color="#FFD700" />
                            <span>1 Grand Winner</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
