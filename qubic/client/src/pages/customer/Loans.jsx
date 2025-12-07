import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const CustomerLoans = () => {
    const [limit, setLimit] = useState(0);
    const [debt, setDebt] = useState(0);
    const [accountStatus, setAccountStatus] = useState('ACTIVE');

    const [amount, setAmount] = useState(500);
    const [duration, setDuration] = useState(7);
    const [loans, setLoans] = useState([]);
    const [processing, setProcessing] = useState(false);

    const [payModal, setPayModal] = useState(null); // Loan object to repay
    const [cardNum, setCardNum] = useState('');

    const customerId = localStorage.getItem('customerId');

    const fetchInfo = () => {
        fetch(`${API_BASE_URL}/customer/${customerId}`)
            .then(res => res.json())
            .then(data => {
                setLimit(data.credit_limit);
                setDebt(data.total_debt_qubic || 0);
                setAccountStatus(data.status || 'ACTIVE');
            });

        fetch(`${API_BASE_URL}/customer/${customerId}/history`)
            .then(res => res.json())
            .then(data => setLoans(data.filter(i => i.type === 'LOAN' && i.status === 'ACTIVE')));
    };

    useEffect(() => {
        if (!customerId) {
            // Wait a bit or redirect immediately? 
            // Better to handle in Layout, but page-level safety is good.
            // For now, simple redirect if missing.
            // We can assume Layout might handle it later, but let's be safe.
            return;
        }
        fetchInfo();
    }, [customerId]);

    const handleApply = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/loans/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, amount: parseInt(amount), duration })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Loan Approved! ${amount} QUBIC added. Interest: ${data.loan.amount_interest} QUBIC.`);
                fetchInfo();
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleRepay = async () => {
        if (!payModal) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/loans/repay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, loanId: payModal.id, cardDetails: cardNum })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Repayment Successful! Paid $${data.repaidAmountUSD}`);
                setPayModal(null);
                setCardNum('');
                fetchInfo();
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const isFrozen = accountStatus === 'FROZEN';

    // Interest Calc for Preview
    const interestRate = 0.05;
    const estInterest = Math.ceil(amount * interestRate);
    const estRepayUSD = ((amount + estInterest) * 0.10).toFixed(2);

    return (
        <div style={{ padding: '1.5rem', color: 'white', paddingBottom: '100px' }}>
            {/* Header Stats */}
            <div className="flex-between mb-6">
                <h1 className="page-title" style={{ margin: 0 }}>My Credit</h1>
                <span className={`badge ${isFrozen ? 'expired' : 'success'}`}>{accountStatus}</span>
            </div>

            {/* Dashboard Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'var(--bg-sidebar)', padding: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Debt</p>
                    <h2 style={{ color: 'var(--danger)' }}>{debt.toLocaleString()} Q</h2>
                </div>
                <div className="card" style={{ background: 'var(--bg-sidebar)', padding: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Credit Limit</p>
                    <h2 style={{ color: 'var(--success)' }}>{limit.toLocaleString()} Q</h2>
                </div>
            </div>

            {/* Apply Section */}
            <h3 style={{ marginBottom: '1rem' }}>Request Loan</h3>
            {isFrozen ? (
                <div className="card mb-8" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <h3 style={{ color: 'var(--danger)', margin: 0 }}>Account Frozen</h3>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Your account is frozen due to overdue payments. Please repay your active loans to unlock new credit.
                    </p>
                </div>
            ) : (
                <div className="card mb-8">
                    <div className="mb-4">
                        <label className="input-label">Amount (QUBIC)</label>
                        <input
                            type="range" min="100" max={limit - debt} step="100"
                            value={amount} onChange={e => setAmount(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div className="flex-between mt-2">
                            <span>{amount} Q</span>
                            <span style={{ color: 'var(--text-muted)' }}>Avail: {limit - debt}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="info-row" style={{ fontSize: '0.9rem' }}>
                            <span>Interest (5%)</span>
                            <span>+ {estInterest} Q</span>
                        </div>
                        <div className="info-row" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                            <span>Repayment Amount</span>
                            <span>${estRepayUSD} USD</span>
                        </div>
                    </div>

                    <button
                        onClick={handleApply} disabled={processing}
                        className="btn btn-primary btn-block"
                        style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))' }}
                    >
                        {processing ? 'Processing...' : 'Get Instant Cash'}
                    </button>
                </div>
            )}

            <h3>Active Loans</h3>
            {loans.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active loans.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loans.map(l => (
                        <div key={l.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
                            <div className="flex-between">
                                <span style={{ fontWeight: 600 }}>{l.amount_principal} Q</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Due: {new Date(l.due_date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                Repay Amount: <strong style={{ color: 'white' }}>${l.total_repay_usd} USD</strong>
                            </div>
                            <button
                                onClick={() => setPayModal(l)}
                                className="btn btn-block"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', padding: '0.5rem' }}
                            >
                                Pay Now
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Repayment Modal */}
            {payModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'end', justifyContent: 'center', zIndex: 200
                }}>
                    <div className="card" style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, animation: 'slideUp 0.3s' }}>
                        <div className="flex-between mb-4">
                            <h3>Repay Loan</h3>
                            <button onClick={() => setPayModal(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        <p style={{ marginBottom: '1.5rem' }}>
                            Total Due: <strong style={{ fontSize: '1.2rem' }}>${payModal.total_repay_usd} USD</strong>
                        </p>

                        <div className="input-group">
                            <label className="input-label">Card Number (Mock)</label>
                            <input
                                type="text" placeholder="0000 0000 0000 0000"
                                value={cardNum} onChange={e => setCardNum(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <button
                            onClick={handleRepay} disabled={processing}
                            className="btn btn-primary btn-block"
                            style={{ background: 'var(--success)' }}
                        >
                            {processing ? 'Processing...' : `Pay $${payModal.total_repay_usd}`}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CustomerLoans;
