import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const MerchantLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('merchantName');
        navigate('/merchant/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="mb-8 p-3">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Q-Pay
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Merchant Portal</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <Link to="/merchant/dashboard" className={`nav-link ${isActive('/merchant/dashboard') ? 'active' : ''}`}>
                        Dashboard
                    </Link>
                    <Link to="/merchant/create" className={`nav-link ${isActive('/merchant/create') ? 'active' : ''}`}>
                        Create Payment
                    </Link>
                    <Link to="/merchant/history" className={`nav-link ${isActive('/merchant/history') ? 'active' : ''}`}>
                        Payments History
                    </Link>
                    <Link to="/merchant/profile" className={`nav-link ${isActive('/merchant/profile') ? 'active' : ''}`}>
                        Profile
                    </Link>
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <button
                        onClick={handleLogout}
                        className="btn btn-block"
                        style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MerchantLayout;
