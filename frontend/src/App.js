import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewBill from './pages/NewBill';
import CustomerHistory from './pages/CustomerHistory';
import KatthaAccounts from './pages/KatthaAccounts';
import EditBill from './pages/EditBill';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-bill" element={<NewBill />} />
          <Route path="/customer-history" element={<CustomerHistory />} />
          <Route path="/kattha-accounts" element={<KatthaAccounts />} />
          <Route path="/edit-bill/:id" element={<EditBill />} />
          <Route path="/settings" element={<Settings setIsAuthenticated={setIsAuthenticated} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
