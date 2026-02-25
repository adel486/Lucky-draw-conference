import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Users, LogOut, Award, Trash2 } from 'lucide-react';
import SpinToWin from '../components/SpinToWin';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loadingAuthed, setLoadingAuthed] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [recentWinners, setRecentWinners] = useState([]);
    const [currentWinner, setCurrentWinner] = useState(null);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/admin/login');
            } else {
                setLoadingAuthed(false);
            }
        });

        return () => unsubAuth();
    }, [navigate]);

    useEffect(() => {
        if (loadingAuthed) return;

        // Listen to participants
        const qParticipants = query(collection(db, 'participants'), orderBy('registeredAt', 'desc'));
        const unsubParticipants = onSnapshot(qParticipants, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setParticipants(data);
        });

        // Listen to winners
        const qWinners = query(collection(db, 'winners'), orderBy('wonAt', 'desc'), limit(5));
        const unsubWinners = onSnapshot(qWinners, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentWinners(data);
        });

        return () => {
            unsubParticipants();
            unsubWinners();
        };
    }, [loadingAuthed]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    const handleClearWinners = async () => {
        if (!window.confirm("Are you sure you want to clear all previous winners? This cannot be undone.")) return;

        try {
            const winnersSnapshot = await getDocs(collection(db, 'winners'));
            const deletePromises = winnersSnapshot.docs.map(docSnap =>
                deleteDoc(doc(db, 'winners', docSnap.id))
            );
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error clearing winners:", error);
            alert("Failed to clear winners");
        }
    };

    if (loadingAuthed) {
        return <div className="page-container"><div className="gold-text">Verifying Access...</div></div>;
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', zIndex: 1, position: 'relative' }}>
            {/* Background layer */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, background: 'var(--bg-color)' }}>
                <div className="bg-flare glow-top-right"></div>
                <div className="bg-flare glow-bottom-left"></div>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1.5rem, 5vw, 3rem)', padding: 'clamp(0.75rem, 2.5vw, 1rem) clamp(1rem, 3vw, 2rem)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '16px', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="gold-text" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', margin: 0 }}>Admin Dashboard</h1>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: 'clamp(6px, 2vw, 8px) clamp(12px, 4vw, 16px)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)' }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(clamp(250px, 40vw, 300px), 1fr) 2fr', gap: 'clamp(1rem, 3vw, 2rem)', alignItems: 'start' }} className="admin-dashboard-grid">

                {/* Left Column: Stats & Spin */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }}>
                            <Users color="#a0aabf" />
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Total Eligible</h3>
                        </div>
                        <p className="gold-text" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', margin: 0, lineHeight: 1 }}>{participants.length}</p>
                    </div>

                    <SpinToWin
                        isEligibleParticipantsEmpty={participants.length === 0}
                        onWinnerSelected={(winner) => setCurrentWinner(winner)}
                    />

                    {currentWinner && (
                        <div className="glass-panel animate-float" style={{ padding: 'clamp(1rem, 3vw, 2rem)', border: '2px solid rgba(255,215,0,0.5)', textAlign: 'center' }}>
                            <h3 className="gold-text" style={{ marginBottom: 'clamp(0.5rem, 2vw, 1rem)', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>Winner Selected! 🎉</h3>
                            <p style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 'bold' }}>{currentWinner.name}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>{currentWinner.college}</p>
                            <p style={{ color: '#4CAF50', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginTop: 'clamp(0.5rem, 2vw, 1rem)' }}>Email & SMS notifications simulated!</p>

                            <button
                                className="btn-secondary"
                                style={{ marginTop: 'clamp(1rem, 3vw, 1.5rem)', width: '100%', borderColor: 'rgba(255, 77, 79, 0.5)', color: '#ff4d4f', fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)', padding: 'clamp(8px, 2.5vw, 10px)' }}
                                onClick={() => setCurrentWinner(null)}
                            >
                                Reset Selection
                            </button>
                        </div>
                    )}

                </div>

                {/* Right Column: List */}
                <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 2rem)', height: 'clamp(400px, 60vh, 600px)', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1rem, 3vw, 1.5rem)', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(1rem, 4vw, 1.3rem)', margin: 0 }}>
                            Recent Winners
                        </h3>
                        {recentWinners.length > 0 && (
                            <button
                                onClick={handleClearWinners}
                                className="btn-secondary"
                                style={{ padding: 'clamp(4px, 1.5vw, 6px) clamp(8px, 3vw, 12px)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                title="Clear All Winners"
                            >
                                <Trash2 size={14} /> Clear
                            </button>
                        )}
                    </div>
                    {recentWinners.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No winners selected yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {recentWinners.map(winner => (
                                <div key={winner.id} style={{ background: 'rgba(255,215,0,0.1)', padding: 'clamp(0.75rem, 2.5vw, 1rem)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)', border: '1px solid rgba(255,215,0,0.2)' }}>
                                    <Award color="#FFD700" size={28} />
                                    <div>
                                        <strong style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#fff' }}>{winner.name}</strong>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)' }}>{winner.college} • {new Date(winner.wonAt?.toMillis() || Date.now()).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)', fontSize: 'clamp(1rem, 4vw, 1.3rem)', borderTop: '1px solid var(--surface-border)', paddingTop: 'clamp(1rem, 3vw, 1.5rem)' }}>
                        Recent Registrations
                    </h3>
                    {participants.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>No participants yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                            {participants.slice(0, 15).map(p => (
                                <div key={p.id} style={{ padding: 'clamp(0.75rem, 2.5vw, 1rem)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#fff', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>{p.name}</div>
                                        <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)' }}>{p.email} • {p.phone}</div>
                                    </div>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                                        {p.college}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
