import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreatePayment from './pages/CreatePayment';
import PaymentsHistory from './pages/PaymentsHistory';
import PaymentPage from './pages/PaymentPage';
import Receipt from './pages/Receipt';
import MerchantLayout from './layouts/MerchantLayout';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHome from './pages/customer/Home';
import CustomerLogin from './pages/customer/Login';
import CustomerLoans from './pages/customer/Loans';
import ScanPay from './pages/customer/ScanPay';
import CustomerActivity from './pages/customer/Activity';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const merchantName = localStorage.getItem('merchantName');
  if (!merchantName) {
    return <Navigate to="/merchant/login" replace />;
  }
  return <MerchantLayout />; // This uses Outlet
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Merchant Routes */}
        <Route path="/merchant/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/merchant/dashboard" element={<Dashboard />} />
          <Route path="/merchant/create" element={<CreatePayment />} />
          <Route path="/merchant/history" element={<PaymentsHistory />} />
          <Route path="/merchant/profile" element={<div className="p-8 text-white">Profile Page (Placeholder)</div>} />
        </Route>

        {/* Customer App Routes */}
        <Route path="/app/login" element={<CustomerLogin />} />
        <Route path="/app/home" element={<CustomerLayout><CustomerHome /></CustomerLayout>} />
        <Route path="/app/loans" element={<CustomerLayout><CustomerLoans /></CustomerLayout>} />
        <Route path="/app/scan" element={<CustomerLayout><ScanPay /></CustomerLayout>} />
        <Route path="/app/activity" element={<CustomerLayout><CustomerActivity /></CustomerLayout>} />

        {/* Public Payment Link (Standalone) */}
        <Route path="/pay/:id" element={<PaymentPage />} />
        <Route path="/receipt" element={<Receipt />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
