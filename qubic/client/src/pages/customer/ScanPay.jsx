import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';

const ScanPay = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [error, setError] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);

    // Manual Entry State
    const [manualId, setManualId] = useState('');

    // 1. Start Camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                setMediaStream(stream);
                setHasPermission(true);
            } catch (err) {
                console.error("Camera access error:", err);
                setError(err.name);
                setHasPermission(false);
            }
        };

        startCamera();

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 2. Attach Stream
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.setAttribute('playsinline', true);
            videoRef.current.play().catch(e => console.log('Video play error', e));
        }
    }, [mediaStream, hasPermission]);

    // 3. Scan Loop
    useEffect(() => {
        if (!mediaStream || !videoRef.current) return;

        let animationFrameId;

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "attemptBoth",
                    });

                    if (code) {
                        if (code.data && code.data.startsWith('P-')) {
                            console.log("Valid Payment ID found:", code.data);
                            navigate(`/pay/${code.data}`);
                            return;
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        tick();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [mediaStream, navigate]);

    const handleMockScan = () => {
        const mockPaymentId = 'P-2025-0001';
        navigate(`/pay/${mockPaymentId}`);
    };

    const handleManualSubmit = () => {
        let id = manualId.trim();
        if (!id) return;

        // Handle full URL paste logic if user pastes a local link
        // e.g. http://localhost:5173/pay/P-2025-0001
        if (id.includes('/pay/')) {
            const parts = id.split('/pay/');
            // Take the last part
            id = parts[parts.length - 1];
        }

        // Basic validation for P-YYYY-XXXX format
        // We can be a bit loose to allow future formats, but it should definitely have content
        if (!id.startsWith('P-')) {
            alert('Invalid ID format. Expected format: P-YYYY-XXXX');
            return;
        }

        navigate(`/pay/${id}`);
    };

    return (
        <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
            <h1 className="page-title">Scan & Pay</h1>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                {/* Camera Viewfinder (Click disabled) */}
                <div
                    style={{
                        width: '300px',
                        height: '300px',
                        border: '2px dashed var(--primary)',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}
                >
                    {/* Real Camera Video */}
                    {hasPermission === true && (
                        <video
                            ref={videoRef}
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)'
                            }}
                        />
                    )}

                    {/* Hidden Canvas */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Permission / Error States */}
                    {hasPermission === false && (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Camera access denied</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {error === 'NotAllowedError' ? 'Please enable camera permissions.' : 'No camera found.'}
                            </p>
                        </div>
                    )}

                    {hasPermission === null && (
                        <p>Requesting camera...</p>
                    )}

                    {/* Scanner Line */}
                    <div className="scanner-line"></div>
                </div>

                {/* Manual Entry Section */}
                <div style={{ width: '100%', maxWidth: '300px', display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Or enter ID (e.g. P-2025-0001)"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleManualSubmit}
                        className="btn btn-primary"
                        style={{ padding: '0 20px', borderRadius: '12px' }}
                    >
                        Go
                    </button>
                </div>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleMockScan}>Tap to Simulate Scan</span> (Demo Mode)
                </p>

            </div>

            <style>{`
                .scanner-line {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    background: var(--primary);
                    box-shadow: 0 0 4px var(--primary);
                    animation: scan 2s infinite linear;
                    top: 0;
                }
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </div>
    );
};

export default ScanPay;
