import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPayments: 0,
        pendingCount: 0,
        completedCount: 0,
        todayRevenue: 0
    });
    const navigate = useNavigate();
    const merchantName = localStorage.getItem('merchantName');
    const merchantId = localStorage.getItem('merchantId');

    useEffect(() => {
        if (!merchantId) {
            navigate('/merchant/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/payments?merchantId=${merchantId}`);
                if (!res.ok) throw new Error('Failed to fetch payments');

                const data = await res.json();
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                const newStats = data.reduce((acc, curr) => {
                    const isPaid = curr.status === 'PAID';
                    const paymentDate = new Date(curr.createdAt).getTime();

                    acc.totalPayments++;
                    if (isPaid) {
                        acc.completedCount++;
                        acc.totalRevenue += Number(curr.amount);
                        if (paymentDate >= today) {
                            acc.todayRevenue += Number(curr.amount);
                        }
                    } else {
                        acc.pendingCount++;
                    }
                    return acc;
                }, { totalRevenue: 0, totalPayments: 0, pendingCount: 0, completedCount: 0, todayRevenue: 0 });

                setStats(newStats);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };

        fetchStats();
    }, [merchantId, navigate]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="page-title">Welcome back, {merchantName} 👋</h1>
                <p className="page-subtitle">Here's what's happening with your payments today.</p>
            </div>

            <div className="stats-grid">
                {/* Total Revenue */}
                <div className="stat-card">
                    <div className="stat-label">
                        <span>Total Revenue</span>
                        <span style={{ color: 'var(--success)' }}>₹</span>
                    </div>
                    <div className="stat-value">{stats.totalRevenue.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>QUBIC</span></div>
                    <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        +{stats.todayRevenue} today
                    </div>
                </div>

                {/* Pending */}
                <div className="stat-card">
                    <div className="stat-label">
                        <span>Pending</span>
                        <span style={{ color: 'var(--warning)' }}>•</span>
                    </div>
                    <div className="stat-value">{stats.pendingCount}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Awaiting payment</div>
                </div>

                {/* Completed */}
                <div className="stat-card">
                    <div className="stat-label">
                        <span>Completed</span>
                        <span style={{ color: 'var(--success)' }}>✓</span>
                    </div>
                    <div className="stat-value">{stats.completedCount}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Successful</div>
                </div>

                {/* Total Transactions */}
                <div className="stat-card">
                    <div className="stat-label">
                        <span>Total Requests</span>
                        <span>#</span>
                    </div>
                    <div className="stat-value">{stats.totalPayments}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>All time</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
