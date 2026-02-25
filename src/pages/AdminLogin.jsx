import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Shield, Loader } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!credentials.email || !credentials.password) {
            setError('Please fill all fields');
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid admin credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="bg-flare glow-bottom-left" style={{ background: 'rgba(255, 0, 0, 0.1)' }}></div>

            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', maxWidth: 'min(90vw, 400px)', width: '100%', textAlign: 'center' }}>
                <Shield size={40} color="#a0aabf" style={{ marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }} />

                <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)', color: '#fff' }}>
                    Admin Portal
                </h2>

                {error && (
                    <div style={{ color: '#ff4d4f', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)', padding: 'clamp(0.6rem, 2vw, 0.8rem)', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '8px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Admin Email"
                            value={credentials.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: 'clamp(0.5rem, 2vw, 1rem)', height: 'clamp(44px, 8vw, 48px)' }}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="spinning" size={20} /> : 'Authenticate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
