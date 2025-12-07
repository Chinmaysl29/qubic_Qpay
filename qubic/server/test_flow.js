const fetch = require('node-fetch'); // Assuming node-fetch 2 or use native in node 18+

async function run() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merchantName: 'Test Verify' })
        });
        const user = await loginRes.json();
        console.log('User:', user);

        if (!user.id) throw new Error('No user ID returned');

        console.log('2. Creating Payment...');
        const payRes = await fetch('http://localhost:3001/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchantId: user.id,
                amount: 123,
                asset: 'QUBIC',
                description: 'Auto Verify'
            })
        });
        const payment = await payRes.json();
        console.log('Payment:', payment);

        if (!payment.id || !payment.id.startsWith('P-')) throw new Error('Invalid Payment ID format');

        console.log('SUCCESS: System is working.');
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

run();
