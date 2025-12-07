import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Logo */}
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>Q</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Q-Pay</h2>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>

                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                    Welcome to <span style={{ color: 'var(--primary)' }}>Q-Pay</span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '4rem' }}>
                    Who are you?
                </p>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '800px' }}>

                    {/* Merchant Option */}
                    <button
                        onClick={() => navigate('/merchant/login')}
                        className="role-select-btn"
                        style={{ background: 'var(--primary)' }} // Blue-ish
                    >
                        <div className="icon-circle">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span>I am a Merchant</span>
                    </button>

                    {/* Customer Option */}
                    <button
                        onClick={() => navigate('/app/login')}
                        className="role-select-btn"
                        style={{ background: 'var(--success)' }} // Green-ish
                    >
                        <div className="icon-circle">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span>I am a Customer</span>
                    </button>

                </div>
            </div>

            {/* Inline Styles for this specific component to adapt Layout */}
            <style>{`
                .role-select-btn {
                    flex: 1;
                    min-width: 280px;
                    max-width: 340px;
                    height: 180px;
                    border-radius: 24px;
                    border: none;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-size: 1.25rem;
                    font-weight: 600;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }
                .role-select-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
                    filter: brightness(1.1);
                }
                .role-select-btn:active {
                    transform: scale(0.98);
                }
                .icon-circle {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
