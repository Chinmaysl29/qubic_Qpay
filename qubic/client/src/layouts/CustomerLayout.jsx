import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const CustomerLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
            navigate('/app/login');
        }
    }, [navigate]);

    return (
        <div style={{ paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {children || <Outlet />}

            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '1rem 0.5rem',
                zIndex: 100
            }}>
                <NavButton
                    icon={<HomeIcon />}
                    label="Home"
                    active={isActive('/app/home')}
                    onClick={() => navigate('/app/home')}
                />
                <NavButton
                    icon={<ScanIcon />}
                    label="Scan"
                    active={isActive('/app/scan')}
                    onClick={() => navigate('/app/scan')}
                    highlight
                />
                <NavButton
                    icon={<BankIcon />}
                    label="Loans"
                    active={isActive('/app/loans')}
                    onClick={() => navigate('/app/loans')}
                />
                <NavButton
                    icon={<ClockIcon />}
                    label="Activity"
                    active={isActive('/app/activity')}
                    onClick={() => navigate('/app/activity')}
                />
            </div>
        </div>
    );
};

const NavButton = ({ icon, label, active, onClick, highlight }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: active ? (highlight ? 'white' : 'var(--primary)') : 'var(--text-muted)',
            gap: '4px',
            fontSize: '0.75rem',
            position: 'relative',
            top: highlight ? '-20px' : '0'
        }}
    >
        <div style={{
            background: highlight ? 'var(--primary)' : 'transparent',
            padding: highlight ? '12px' : '0',
            borderRadius: '50%',
            boxShadow: highlight ? '0 4px 12px rgba(59, 130, 246, 0.5)' : 'none',
            color: highlight ? 'white' : 'currentColor'
        }}>
            {icon}
        </div>
        <span>{label}</span>
    </button>
);

// Icons
const HomeIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ScanIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
const BankIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default CustomerLayout;
