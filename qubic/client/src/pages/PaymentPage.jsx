import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchPayment = async () => {
            if (id === 'demo-payment-123') {
                setPayment({
                    id: 'P-2025-0000',
                    merchantName: 'Qubic Demo Store',
                    amount: 2500,
                    asset: 'QUBIC',
                    description: 'Demo Transaction',
                    status: 'PENDING'
                });
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/payments/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setPayment(data);
                    // If already paid, standard flow might imply showing receipt or just disabled button.
                    // Spec doesn't strictly say auto-redirect on load if paid, so we show the page.
                    // But if PAID, we might want to redirect. For now, let's keep it on page but Paid status.
                } else {
                    setError('Invalid or expired payment link');
                }
            } catch (err) {
                console.error(err);
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    const handlePay = async () => {
        if (!payment) return;
        setProcessing(true);

        // Demo case
        if (id === 'demo-payment-123') {
            setTimeout(() => {
                navigate('/receipt', {
                    state: {
                        payment: { ...payment, status: 'PAID', paidAt: new Date().toISOString(), receiptId: 'REC-DEMO-123' }
                    }
                });
            }, 1000);
            return;
        }

        // Real API case
        try {
            // For MVP, assume 'cust-demo-001' is logged in or passed via a simplified context.
            // In a real app we'd get this from context/localStorage.
            // Get logged in user if available
            const customerId = localStorage.getItem('customerId');

            const res = await fetch(`${API_BASE_URL}/payments/${payment.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId })
            });
            const data = await res.json();

            if (res.ok) {
                setTimeout(() => {
                    navigate('/receipt', {
                        state: {
                            payment: {
                                ...payment,
                                status: data.status,
                                paidAt: data.paidAt,
                                receiptId: 'RCP-' + data.id
                            }
                        }
                    });
                }, 1000);
            } else {
                alert(data.message || 'Payment failed');
                setProcessing(false);
            }
        } catch (err) {
            console.error(err);
            alert('Payment failed');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="center-screen">
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading payment details...</p>
                <style>{`
                    .center-screen { display: flex; flexDirection: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg-dark); color: white; }
                    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="center-screen">
                <div className="card text-center" style={{ maxWidth: '400px', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Link Error</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                        Go Home
                    </button>
                </div>
                <style>{`
                    .center-screen { display: flex; flexDirection: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg-dark); color: white; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page-center" style={{ padding: '1rem', background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>

                <div className="text-center mb-8">
                    <div style={{ width: '64px', height: '64px', background: 'var(--bg-sidebar)', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <svg width="32" height="32" stroke="var(--text-main)" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{payment.merchantName}</h2>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.85rem' }}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                        Secure Payment
                    </div>
                </div>

                <div className="mb-8" style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div className="flex-between mb-4">
                        <span style={{ color: 'var(--text-muted)' }}>Amount to Pay</span>
                        <span className={`badge ${payment.status === 'PAID' ? 'paid' : 'pending'}`}>{payment.status === 'PAID' ? 'Payment Complete' : 'Waiting for Payment'}</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                        {payment.amount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>{payment.asset}</span>
                    </div>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description</p>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{payment.description || 'No description provided'}</p>
                    </div>
                </div>

                <button
                    onClick={handlePay}
                    disabled={processing || payment.status === 'PAID'}
                    className="btn btn-primary btn-block btn-lg"
                    style={{ position: 'relative', minHeight: '56px' }}
                >
                    {processing ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : payment.status === 'PAID' ? (
                        'Already Paid'
                    ) : (
                        `Simulate Pay with Wallet`
                    )}
                </button>

                <div className="text-center mt-4">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        For this prototype we simulate real wallet authorization.
                    </p>
                </div>

                <div className="text-center mt-6">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                        Secured by Q-Pay Protocol
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default PaymentPage;
