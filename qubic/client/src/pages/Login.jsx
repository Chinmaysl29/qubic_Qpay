import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Login = () => {
    const [merchantName, setMerchantName] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!merchantName) return;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantName })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('merchantName', data.name);
                localStorage.setItem('merchantId', data.id);
                navigate('/merchant/dashboard');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error("Login failed", error);
            alert('Network error');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="text-center mb-8">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Q-Pay</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Merchant Portal Login</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Merchant Name</label>
                        <input
                            type="text"
                            value={merchantName}
                            onChange={(e) => setMerchantName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Srujan Coffee House"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
