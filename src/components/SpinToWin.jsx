import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const SpinToWin = ({ onWinnerSelected, isEligibleParticipantsEmpty }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [error, setError] = useState('');
    const [selectedWinner, setSelectedWinner] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSpin = async () => {
        if (isEligibleParticipantsEmpty) {
            setError("No participants available for the draw!");
            return;
        }

        setIsSpinning(true);
        setError('');

        try {
            // Simulate suspenseful drumroll/delay before picking the winner
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 1. Fetch all eligible participants directly from Firestore
            const participantsRef = collection(db, 'participants');
            const snapshot = await getDocs(participantsRef);

            if (snapshot.empty) {
                throw new Error("No eligible participants found for the draw.");
            }

            const participants = [];
            snapshot.forEach((doc) => {
                participants.push({ id: doc.id, ...doc.data() });
            });

            // 2. Select a random winner
            const randomIndex = Math.floor(Math.random() * participants.length);
            const selectedWinner = participants[randomIndex];

            // 3. Store the winner in the winners collection
            const winnerData = {
                name: selectedWinner.name,
                college: selectedWinner.college,
                email: selectedWinner.email,
                phone: selectedWinner.phone,
                wonAt: serverTimestamp(),
                participantId: selectedWinner.id
            };

            const winnerDocRef = await addDoc(collection(db, 'winners'), winnerData);

            // Assign ID for the local UI state
            const winnerToReturn = { ...winnerData, id: winnerDocRef.id };

            // Set winner for confirmation instead of sending email immediately
            setSelectedWinner(winnerToReturn);
            setIsConfirming(true);

        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred while selecting the winner.");
        } finally {
            setIsSpinning(false);
        }
    };

    const confirmWinner = async () => {
        if (!selectedWinner) return;

        try {
            // Send Email via EmailJS
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (serviceId && templateId && publicKey) {
                await emailjs.send(
                    serviceId,
                    templateId,
                    {
                        // Sending to the winner's email
                        to_email: selectedWinner.email,
                        to_name: selectedWinner.name,
                        from_name: "AI Conference 2026 Organizing Committee",

                        // Official congratulatory message
                        message: `Dear ${selectedWinner.name},

Congratulations! You have been selected as a winner in the Lucky Draw at the AI Conference 2026 organized by Union Christian College UCCIMT.

Event Details:
- Conference: AI Conference 2026
- Theme: AI Conference
- Organizer: Union Christian College UCCIMT

Your participation and engagement in the conference have been greatly appreciated. Please contact the organizing committee at your earliest convenience to claim your prize.

We look forward to your continued involvement in future events.

Best Regards,
AI Conference 2026 Organizing Committee
Union Christian College UCCIMT`,
                    },
                    publicKey
                );
                console.log(`Email successfully sent to winner ${selectedWinner.name} at ${selectedWinner.email}`);
            } else {
                console.warn("EmailJS credentials (Service ID, Template ID, or Public Key) not found in .env. Skipping email notification.");
            }

            // Explosion of confetti
            const duration = 5000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 10,
                    angle: 60,
                    spread: 80,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FFFFFF', '#FF69B4']
                });
                confetti({
                    particleCount: 10,
                    angle: 120,
                    spread: 80,
                    origin: { x: 1 },
                    colors: ['#FFD700', '#FFA500', '#FFFFFF', '#FF69B4']
                });
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            onWinnerSelected(selectedWinner);

            // Reset states
            setSelectedWinner(null);
            setIsConfirming(false);

        } catch (emailErr) {
            console.error("Failed to send email via EmailJS:", emailErr);
            // Still proceed with winner selection even if email fails
            onWinnerSelected(selectedWinner);
            setSelectedWinner(null);
            setIsConfirming(false);
        }
    };

    const cancelSelection = () => {
        setSelectedWinner(null);
        setIsConfirming(false);
    };

    return (
        <div className="glass-panel animate-glow" style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center', position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 'min(95vw, 600px)' }}>
            {isConfirming && selectedWinner ? (
                // Winner Confirmation Screen
                <div>
                    <h2 style={{ color: '#FFD700', marginBottom: 'clamp(1rem, 3vw, 2rem)', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)' }}>🎉 Winner Selected! 🎉</h2>

                    <div style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '2px solid rgba(255, 215, 0, 0.3)',
                        borderRadius: '15px',
                        padding: 'clamp(1rem, 3vw, 2rem)',
                        marginBottom: 'clamp(1rem, 3vw, 2rem)',
                        textAlign: 'left',
                        maxWidth: 'min(90vw, 500px)',
                        margin: '0 auto clamp(1rem, 3vw, 2rem) auto'
                    }}>
                        <h3 style={{ color: '#FFD700', marginBottom: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>Winner Details</h3>
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}><strong>Name:</strong> {selectedWinner.name}</p>
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}><strong>College:</strong> {selectedWinner.college}</p>
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}><strong>Email:</strong> {selectedWinner.email}</p>
                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}><strong>Phone:</strong> {selectedWinner.phone}</p>
                    </div>

                    <p style={{ marginBottom: 'clamp(1rem, 3vw, 2rem)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
                        Confirm this winner to send the congratulatory email and announce the result.
                    </p>

                    <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn-primary"
                            style={{ fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', padding: 'clamp(10px, 3vw, 14px) clamp(20px, 6vw, 30px)' }}
                            onClick={confirmWinner}
                        >
                            ✅ Confirm & Send Email
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', padding: 'clamp(10px, 3vw, 14px) clamp(20px, 6vw, 30px)', background: '#666', border: '2px solid #666' }}
                            onClick={cancelSelection}
                        >
                            ❌ Select Another Winner
                        </button>
                    </div>
                </div>
            ) : (
                // Normal Spin Interface
                <>
                    {/* Visual Wheel / Slot Effect Placeholder */}
                    <div style={{ position: 'relative', height: 'clamp(120px, 25vw, 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
                        {isSpinning ? (
                            <div className="spinning-fast" style={{ width: 'clamp(80px, 20vw, 100px)', height: 'clamp(80px, 20vw, 100px)', borderRadius: '50%', background: 'conic-gradient(#FFD700, #FF8C00, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' }}>
                                <div style={{ width: 'clamp(64px, 16vw, 80px)', height: 'clamp(64px, 16vw, 80px)', borderRadius: '50%', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader className="spinning gold-text" size={28} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: 'clamp(80px, 20vw, 100px)', height: 'clamp(80px, 20vw, 100px)', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '2px solid rgba(255,215,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="gold-text" style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 'bold' }}>?</span>
                            </div>
                        )}
                    </div>

                    {error && <p style={{ color: '#ff4d4f', marginBottom: 'clamp(0.5rem, 2vw, 1rem)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>{error}</p>}

                    <button
                        className="btn-primary"
                        style={{ fontSize: 'clamp(1rem, 4vw, 1.3rem)', padding: 'clamp(12px, 4vw, 16px) clamp(24px, 8vw, 40px)', letterSpacing: '1px', textTransform: 'uppercase' }}
                        onClick={handleSpin}
                        disabled={isSpinning || isEligibleParticipantsEmpty}
                    >
                        {isSpinning ? 'Selecting...' : 'Spin for Winner!'}
                    </button>
                </>
            )}
        </div>
    );
};

export default SpinToWin;
