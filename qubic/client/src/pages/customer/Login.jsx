import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const CustomerLogin = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    // Removed auto-redirect to allow user to see/switch accounts explicitly.
    // React.useEffect(() => {
    //    if (localStorage.getItem('customerId')) {
    //        navigate('/app/home');
    //    }
    // }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        try {
            console.log('Sending login request for:', trimmedName);
            const res = await fetch(`${API_BASE_URL}/customer/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName })
            });
            console.log('Login response status:', res.status);

            const data = await res.json();

            if (res.ok) {
                console.log('Login success:', data);
                localStorage.setItem('customerId', data.id);
                localStorage.setItem('customerName', data.name);
                navigate('/app/home');
            } else {
                console.error('Login server error:', data);
                alert('Server Error: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Login network error:', err);
            alert('Login Failed: Network Error. Ensure server is running. Details: ' + err.message);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white', padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Customer Login</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Access your wallet and loans</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            Your Name <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>(MUST BE ALL CAPS)</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            placeholder="e.g. JOHN DOE"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-daker)', border: '1px solid var(--border)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontSize: '1rem' }}>
                        Continue
                    </button>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <span style={{ color: 'var(--primary)' }}>One will be created for you.</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CustomerLogin;
