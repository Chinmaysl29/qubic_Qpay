import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerHome = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [name, setName] = useState('User');
    const [wallet, setWallet] = useState('...');
    const customerId = localStorage.getItem('customerId');

    useEffect(() => {
        if (!customerId) {
            navigate('/app/login');
            return;
        }

        // Fetch wallet
        fetch(`http://localhost:3001/api/customer/${customerId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Invalid user');
                }
                return res.json();
            })
            .then(data => {
                setBalance(data.balance_qubic);
                setName(data.name);
                setWallet(data.walletAddress);
            })
            .catch(() => {
                localStorage.removeItem('customerId');
                navigate('/app/login');
            });
    }, [navigate, customerId]);

    return (
        <div style={{ padding: '1.5rem', color: 'white' }}>
            {/* Header */}
            <div className="flex-between mb-8">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hello, {name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{wallet}</p>
                </div>
                <div
                    onClick={() => {
                        if (window.confirm('Logout?')) {
                            localStorage.removeItem('customerId');
                            localStorage.removeItem('customerName');
                            navigate('/app/login');
                        }
                    }}
                    style={{
                        width: '40px', height: '40px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <svg width="20" height="20" fill="none" stroke="var(--danger)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
            </div>

            {/* Balance Card */}
            <div className="card mb-8" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>Total Balance</p>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{balance.toLocaleString()} <span style={{ fontSize: '1rem' }}>QUBIC</span></h1>
            </div>

            {/* Quick Actions */}
            <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <ActionBtn label="Scan" icon={<ScanIcon />} onClick={() => navigate('/app/scan')} />
                {/* <ActionBtn label="Pay ID" icon={<AtIcon />} onClick={() => navigate('/')} />  Removed as per request */}
                <ActionBtn label="Loans" icon={<BankIcon />} onClick={() => navigate('/app/loans')} />
                <ActionBtn label="History" icon={<ClockIcon />} onClick={() => navigate('/app/activity')} />
            </div>

            {/* Recent Activity */}
            <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
            <div className="card" style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No recent transactions</p>
            </div>
        </div>
    );
};

const ActionBtn = ({ label, icon, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--bg-sidebar)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            {icon}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
);

const ScanIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
const AtIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
const BankIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default CustomerHome;
