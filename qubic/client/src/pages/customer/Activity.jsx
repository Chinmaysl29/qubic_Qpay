import React, { useEffect, useState } from 'react';

const Activity = () => {
    const [history, setHistory] = useState([]);
    const customerId = localStorage.getItem('customerId');

    useEffect(() => {
        if (!customerId) return;
        fetch(`http://localhost:3001/api/customer/${customerId}/history`)
            .then(res => res.json())
            .then(data => setHistory(data));
    }, [customerId]);

    return (
        <div style={{ padding: '1.5rem', color: 'white', paddingBottom: '100px' }}>
            <h1 className="page-title">Activity</h1>

            {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No recent activity.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((item) => (
                        <div key={item.id} className="card" style={{ padding: '1rem' }}>
                            <div className="flex-between">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: item.type === 'LOAN' ? 'rgba(59, 130, 246, 0.1)' : (item.type === 'REPAYMENT' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {item.type === 'LOAN' ? '🏦' : (item.type === 'REPAYMENT' ? '💸' : '🛒')}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>
                                            {item.type === 'LOAN' ? 'Loan Taken' : (item.type === 'REPAYMENT' ? 'Loan Repaid' : item.description || 'Payment')}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(item.createdAt || item.paidAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 700, color: item.type === 'LOAN' ? 'var(--primary)' : 'white' }}>
                                        {item.type === 'LOAN' ? '+' : '-'}{item.amount || item.amount_principal} Q
                                    </p>
                                    <span className={`badge ${item.status === 'PAID' ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem' }}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Activity;
