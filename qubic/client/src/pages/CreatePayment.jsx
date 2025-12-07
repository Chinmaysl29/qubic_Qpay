import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePayment = () => {
    const [amount, setAmount] = useState('');
    const [asset, setAsset] = useState('QUBIC');
    const [description, setDescription] = useState('');
    const [createdPayment, setCreatedPayment] = useState(null);
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();

        const merchantId = localStorage.getItem('merchantId');
        if (!merchantId) {
            alert("Session expired");
            navigate('/merchant/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchantId, amount: parseFloat(amount), asset, description })
            });
            const data = await response.json();
            if (response.ok) {
                setCreatedPayment(data);
            } else {
                alert('Error creating payment: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        }
    };

    const paymentLink = createdPayment ? createdPayment.paymentLink : '';

    return (
        <div>
            <h1 className="page-title">Create Payment Request</h1>
            <p className="page-subtitle">Generate a new payment link and QR code for your customer.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Form Section */}
                <div className="card">
                    <form onSubmit={handleCreate}>
                        <div className="input-group">
                            <label className="input-label">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="input-field"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Currency / Asset</label>
                            <select
                                value={asset}
                                onChange={e => setAsset(e.target.value)}
                                className="input-field"
                            >
                                <option value="QUBIC">QUBIC</option>
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="input-field"
                                style={{ height: '120px', resize: 'none' }}
                                placeholder="Order ID, items, or notes..."
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Generate Payment Link
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                <div>
                    {createdPayment ? (
                        <div className="card" style={{ borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Payment Created</h3>
                            </div>

                            <div className="input-group">
                                <label className="input-label">PAYMENT ID</label>
                                <div className="code-box">{createdPayment.id}</div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">PAYMENT LINK</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input readOnly value={paymentLink} className="input-field" />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(paymentLink)}
                                        className="btn"
                                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: 'white', borderRadius: '12px', width: 'fit-content', margin: '0 auto' }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`}
                                    alt="QR Code"
                                    style={{ width: '180px', height: '180px' }}
                                />
                            </div>
                            <p className="text-center" style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Scan to Pay</p>
                        </div>
                    ) : (
                        <div style={{ height: '100%', border: '2px dashed var(--border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                            <p>Fill out the form to generate a new payment request</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePayment;
