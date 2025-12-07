const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { readDB, writeDB } = require('./db');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Mock Login (Create/Get Merchant) ---
app.post('/api/login', (req, res) => {
    const { merchantName } = req.body;
    if (!merchantName) {
        return res.status(400).json({ error: 'Merchant name is required' });
    }

    const db = readDB();
    let merchant = db.merchants.find(m => m.name === merchantName);

    if (!merchant) {
        // Create new merchant if not exists
        merchant = {
            id: crypto.randomUUID(),
            name: merchantName,
            createdAt: new Date().toISOString()
        };
        db.merchants.push(merchant);
        writeDB(db);
    }

    // Return merchant info (simulate session)
    res.json(merchant);
});

// --- Customer Login (New) ---
app.post('/api/customer/login', (req, res) => {
    const { name } = req.body;
    console.log('Login attempt for:', name);
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const db = readDB();
    let customer = db.customers.find(c => c.name.toLowerCase() === name.toLowerCase());

    if (!customer) {
        // Auto-signup
        customer = {
            id: 'cust-' + crypto.randomBytes(4).toString('hex'),
            name,
            walletAddress: 'QUBIC-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
            balance_qubic: 1000, // Starting bonus
            credit_limit: 5000,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
            total_debt_qubic: 0,
            last_repayment_date: null
        };
        db.customers.push(customer);
        writeDB(db);
    }

    // Check Status on Login
    checkAccountStatus(db, customer.id);
    writeDB(db);

    res.json(customer);
});

// --- Helper to Generate ID ---
function generatePaymentId(db) {
    const year = new Date().getFullYear();
    const prefix = `P-${year}`;
    const count = db.payments.filter(p => p.id && p.id.startsWith(prefix)).length;
    const nextNum = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${nextNum}`;
}

// --- Create Payment ---
app.post('/api/payments', (req, res) => {
    const { merchantId, amount, asset, description } = req.body;

    if (!merchantId || !amount || !asset) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDB();
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
    }

    const paymentId = generatePaymentId(db);

    const newPayment = {
        id: paymentId,
        merchant_id: merchantId,
        amount,
        asset,
        description: description || '',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        paidAt: null
    };

    db.payments.push(newPayment);
    writeDB(db);

    res.json({ ...newPayment, paymentLink: `http://localhost:5173/pay/${paymentId}` });
});

// --- Get Merchant Payments ---
app.get('/api/payments', (req, res) => {
    const { merchantId } = req.query;
    if (!merchantId) {
        return res.status(400).json({ error: 'Merchant ID is required' });
    }

    const db = readDB();
    const merchantPayments = db.payments.filter(p => p.merchant_id === merchantId);
    merchantPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(merchantPayments);
});

// --- Get Payment Details (Public) ---
app.get('/api/payments/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const payment = db.payments.find(p => p.id === id);

    if (!payment) {
        return res.status(404).json({ error: 'Invalid or expired payment link' });
    }

    const merchant = db.merchants.find(m => m.id === payment.merchant_id);

    res.json({
        id: payment.id,
        merchantName: merchant ? merchant.name : 'Unknown Merchant',
        amount: payment.amount,
        asset: payment.asset,
        description: payment.description,
        status: payment.status,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt
    });
});

// --- Simulate Payment (Customer End) ---
app.post('/api/payments/:id/pay', (req, res) => {
    const { id } = req.params;
    const { customerId } = req.body;
    const db = readDB();
    const paymentIndex = db.payments.findIndex(p => p.id === id);

    if (paymentIndex === -1) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = db.payments[paymentIndex];
    if (payment.status === 'PAID') {
        return res.status(400).json({ message: 'Already paid' });
    }

    const paidAt = new Date().toISOString();
    const updatedPayment = {
        ...payment,
        status: 'PAID',
        paidAt: paidAt,
        receiptId: crypto.randomBytes(32).toString('hex'),
        paidBy: customerId || null
    };

    db.payments[paymentIndex] = updatedPayment;
    writeDB(db);

    res.json({
        id: updatedPayment.id,
        status: 'PAID',
        paidAt: paidAt
    });
});

// ==========================================
// --- CUSTOMER APP APIs (Advanced Loans) ---
// ==========================================

const INTEREST_RATE = 0.05;
const QUBIC_TO_USD_RATE = 0.10;

// --- Helper: Check & Freeze Account ---
function checkAccountStatus(db, customerId) {
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return;

    const overdueLoans = db.loans.filter(l =>
        l.customerId === customerId &&
        l.status === 'ACTIVE' &&
        new Date() > new Date(l.due_date)
    );

    if (overdueLoans.length > 0) {
        customer.status = 'FROZEN';
        console.log(`Account ${customerId} FROZEN due to overdue loans.`);
    } else if (customer.status === 'FROZEN' && customer.total_debt_qubic === 0) {
        customer.status = 'ACTIVE';
    }
}

// --- Get Customer Wallet ---
app.get('/api/customer/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    let customer = db.customers.find(c => c.id === id);

    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    checkAccountStatus(db, id);
    writeDB(db);
    res.json(customer);
});

// --- Apply for Loan ---
app.post('/api/loans/apply', (req, res) => {
    const { customerId, amount, duration } = req.body;
    const db = readDB();

    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    if (customer.status === 'FROZEN') {
        return res.status(403).json({ error: 'ACCOUNT FROZEN. Please repay outstanding debt to unlock.' });
    }

    if ((customer.total_debt_qubic + amount) > customer.credit_limit) {
        return res.status(400).json({ error: 'Credit limit exceeded.' });
    }

    const interest = Math.ceil(amount * INTEREST_RATE);
    const totalRepayQubic = amount + interest;
    const totalRepayUSD = (totalRepayQubic * QUBIC_TO_USD_RATE).toFixed(2);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + duration);

    const newLoan = {
        id: 'LOAN-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
        customerId,
        amount_principal: amount,
        amount_interest: interest,
        total_repay_qubic: totalRepayQubic,
        total_repay_usd: totalRepayUSD,
        duration,
        due_date: dueDate.toISOString(),
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
    };

    customer.balance_qubic += amount;
    customer.total_debt_qubic += totalRepayQubic;

    db.loans.push(newLoan);
    writeDB(db);

    res.json({ loan: newLoan, newBalance: customer.balance_qubic, status: customer.status });
});

// --- Repay Loan ---
app.post('/api/loans/repay', (req, res) => {
    const { customerId, loanId, cardDetails } = req.body;
    const db = readDB();

    const loanIndex = db.loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) return res.status(404).json({ error: 'Loan not found' });
    const loan = db.loans[loanIndex];

    if (loan.status === 'PAID') return res.status(400).json({ error: 'Loan already paid' });

    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    if (!cardDetails || cardDetails.length < 4) {
        return res.status(400).json({ error: 'Invalid card details' });
    }

    loan.status = 'PAID';
    loan.status = 'PAID';
    loan.paidAt = new Date().toISOString();
    customer.balance_qubic -= loan.total_repay_qubic;
    customer.total_debt_qubic = Math.max(0, customer.total_debt_qubic - loan.total_repay_qubic);
    if (customer.total_debt_qubic === 0) customer.last_repayment_date = loan.paidAt;

    // Unfreeze if clear
    checkAccountStatus(db, customerId);

    writeDB(db);
    res.json({ message: 'Loan repaid successfully', loan });
});

// --- Customer History API ---
app.get('/api/customer/:id/history', (req, res) => {
    const { id } = req.params;
    const db = readDB();

    // 1. Payments
    const payments = db.payments
        .filter(p => p.paidBy === id)
        .map(p => ({ ...p, type: 'PAYMENT' }));

    // 2. Loans (Taken)
    const loansTaken = db.loans
        .filter(l => l.customerId === id)
        .map(l => ({ ...l, type: 'LOAN', amount: l.amount_principal, createdAt: l.createdAt }));

    // 3. Loans (Repaid)
    const loansRepaid = db.loans
        .filter(l => l.customerId === id && l.status === 'PAID' && l.paidAt)
        .map(l => ({
            id: 'REPAY-' + l.id,
            type: 'REPAYMENT',
            amount: l.total_repay_qubic,
            createdAt: l.paidAt || l.createdAt,
            description: 'Loan Repayment',
            status: 'PAID'
        }));

    const history = [...payments, ...loansTaken, ...loansRepaid];

    // Sort by Date Descending
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(history);
});

// --- Get Customer History ---
app.get('/api/customer/:id/history', (req, res) => {
    const { id } = req.params;
    const db = readDB();

    const myLoans = db.loans.filter(l => l.customerId === id).map(l => ({
        type: 'LOAN',
        ...l
    }));

    const myPayments = db.payments.filter(p => p.paidBy === id).map(p => ({
        type: 'PAYMENT',
        ...p
    }));

    const history = [...myLoans, ...myPayments];

    res.json(history.sort((a, b) => {
        const dateA = a.paidAt || a.createdAt;
        const dateB = b.paidAt || b.createdAt;
        return new Date(dateB) - new Date(dateA);
    }));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
