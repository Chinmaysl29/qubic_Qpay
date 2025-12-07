import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Receipt = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const payment = state?.payment;

    useEffect(() => {
        if (!payment) {
            navigate('/');
        }
    }, [payment, navigate]);

    if (!payment) return null;

    return (
        <div className="page-center" style={{ padding: '1rem', background: 'var(--bg-dark)' }}>
            <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
                <div className="success-icon-wrapper mb-8">
                    <div className="success-icon">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Successful ✔</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your transaction has been confirmed.</p>

                <div style={{ background: 'var(--bg-sidebar)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                    <div className="info-row">
                        <span>Amount Paid</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>{payment.amount} {payment.asset}</span>
                    </div>
                    <div className="info-row">
                        <span>Paid to</span>
                        <span style={{ color: 'white' }}>{payment.merchantName}</span>
                    </div>
                    <div className="info-row">
                        <span>Receipt ID</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {payment.receiptId
                                ? (payment.receiptId.startsWith('RCP-') ? payment.receiptId : `RCP-${payment.receiptId.slice(0, 8)}`)
                                : `RCP-${payment.id}`}
                        </span>
                    </div>
                    <div className="info-row">
                        <span>Timestamp</span>
                        <span style={{ fontSize: '0.9rem' }}>{new Date().toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                        "In production this would be an on-chain immutable receipt, verifiable by the transaction hash."
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => window.print()}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        Download Receipt
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)' }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>

            <style>{`
                .success-icon-wrapper {
                    display: flex;
                    justify-content: center;
                }
                .success-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--success);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.15);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Receipt;
