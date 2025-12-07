import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PaymentsHistory = () => {
    const [payments, setPayments] = useState([]);
    const navigate = useNavigate();
    const merchantId = localStorage.getItem('merchantId');

    const fetchPayments = async () => {
        if (!merchantId) return;
        try {
            const res = await fetch(`http://localhost:3001/api/payments?merchantId=${merchantId}`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        if (!merchantId) {
            navigate('/merchant/login');
            return;
        }
        fetchPayments();
        const interval = setInterval(fetchPayments, 5000);
        return () => clearInterval(interval);
    }, [merchantId, navigate]);

    return (
        <div>
            <div className="flex-between mb-8">
                <h1 className="page-title">Payments History</h1>
                <button
                    onClick={fetchPayments}
                    className="btn"
                    style={{ color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)' }}
                >
                    Refresh
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payment ID</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                                    No payments found. Create one to get started!
                                </td>
                            </tr>
                        ) : (
                            payments.map((p) => (
                                <tr key={p.id}>
                                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.id.slice(0, 8)}...</td>
                                    <td>{p.description || '-'}</td>
                                    <td style={{ fontWeight: 700 }}>
                                        {p.amount} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>{p.asset}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${p.status === 'PAID' ? 'status-paid' : 'status-pending'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link
                                            to={`/pay/${p.id}`}
                                            target="_blank"
                                            style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem' }}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsHistory;
