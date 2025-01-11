import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import components
import SignUp from './component/SignUp';
import Login from './component/Login';
import InvoiceForm from './component/InvoiceForm';
import InvoiceList from './component/InvoiceList';
import HomePage from './component/HomePage';
import Settings from './component/SettingsPage';
import Dashboard from './component/dashboard/Dashboard';

// Import InvoiceProvider
import { InvoiceProvider } from './contexts/InvoiceContext'; // Update the path if necessary

function App() {
  return (
    // Wrap the entire application in InvoiceProvider
    <InvoiceProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invoice" element={<InvoiceForm />} />
          <Route path="/invoices" element={<InvoiceList />} />
          
          {/* Dashboard route with nested child routes */}
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Child routes */}
            <Route index element={<HomePage />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoice" element={<InvoiceForm />} />
            <Route path="invoice-form/:id" element={<InvoiceForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </InvoiceProvider>
  );
}

export default App;
