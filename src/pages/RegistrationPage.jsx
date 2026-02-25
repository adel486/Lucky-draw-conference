import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Loader } from 'lucide-react';

const RegistrationPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        college: '',
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.college.trim()) newErrors.college = 'College/Organization is required';

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Valid 10-digit phone number required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = 'Valid email required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for field being typed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const checkDuplicate = async () => {
        const participantsRef = collection(db, 'participants');

        // Check Email
        const emailQuery = query(participantsRef, where('email', '==', formData.email.trim()));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) return 'This email is already registered.';

        // Check Phone
        const phoneQuery = query(participantsRef, where('phone', '==', formData.phone.trim()));
        const phoneSnapshot = await getDocs(phoneQuery);
        if (!phoneSnapshot.empty) return 'This phone number is already registered.';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const duplicateError = await checkDuplicate();
            if (duplicateError) {
                setSubmitError(duplicateError);
                setIsSubmitting(false);
                return;
            }

            // Add to Firestore
            await addDoc(collection(db, 'participants'), {
                name: formData.name.trim(),
                college: formData.college.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                eventId: 'TECH_CONF_2026',
                registeredAt: serverTimestamp(),
            });

            navigate('/confirmation', { state: { name: formData.name } });

        } catch (err) {
            console.error("Error adding document: ", err);
            setSubmitError('Failed to register. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="bg-flare glow-top-right"></div>

            <div className="glass-panel" style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)', width: '100%', maxWidth: 'min(90vw, 500px)' }}>
                <h2 className="gold-text" style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '0.5rem', textAlign: 'center' }}>
                    Registration
                </h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'clamp(1rem, 3vw, 2rem)', fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>
                    Enter your details to secure your spot in the draw!
                </p>

                {submitError && (
                    <div style={{ background: 'rgba(255, 77, 79, 0.1)', border: '1px solid #ff4d4f', padding: 'clamp(0.75rem, 2.5vw, 1rem)', borderRadius: '12px', marginBottom: 'clamp(1rem, 3vw, 1.5rem)', color: '#ff4d4f', textAlign: 'center', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">College / Organization</label>
                        <input
                            type="text"
                            name="college"
                            className="form-input"
                            placeholder="Enter your college/organization name"
                            value={formData.college}
                            onChange={handleChange}
                        />
                        {errors.college && <span className="error-text">{errors.college}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="Enter your 10-digit phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: 'clamp(0.5rem, 2vw, 1rem)', height: 'clamp(44px, 8vw, 52px)' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader className="spinning" size={20} />
                        ) : (
                            <>
                                Confirm Entry <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
