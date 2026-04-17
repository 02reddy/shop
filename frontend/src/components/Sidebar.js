import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ language }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const translations = {
    en: {
      dashboard: 'Dashboard',
      newBill: 'New Bill',
      customerHistory: 'Customer History',
      katthaAccounts: 'Kattha Accounts',
      settings: 'Settings',
      logout: 'Logout'
    },
    te: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      newBill: 'కొత్త బిల్లు',
      customerHistory: 'కస్టమర్ హిస్టరీ',
      katthaAccounts: 'ఖత్తా ఖాతాలు',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్ అవుట్'
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      newBill: 'नया बिल',
      customerHistory: 'ग्राहक इतिहास',
      katthaAccounts: 'खता खाते',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट'
    }
  };

  const t = translations[language] || translations.en;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <div className="sidebar-content">
        <h2 className="sidebar-title">ERP</h2>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-link">{t.dashboard}</Link>
          <Link to="/new-bill" className="nav-link">{t.newBill}</Link>
          <Link to="/customer-history" className="nav-link">{t.customerHistory}</Link>
          <Link to="/kattha-accounts" className="nav-link">{t.katthaAccounts}</Link>
          <Link to="/settings" className="nav-link">{t.settings}</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>{t.logout}</button>
      </div>
    </div>
  );
};

export default Sidebar;
