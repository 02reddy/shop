import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalPending: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const translations = {
    en: {
      dashboard: 'Dashboard',
      totalSales: 'Total Sales',
      totalPending: 'Total Pending Amount',
      totalCustomers: 'Total Customers',
      loading: 'Loading...',
      error: 'Error loading dashboard data',
      refresh: 'Refresh'
    },
    te: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      totalSales: 'మొత్తం విక్రయాలు',
      totalPending: 'మొత్తం బకాయి',
      totalCustomers: 'మొత్తం కస్టమర్‌లు',
      loading: 'లోడ్ చేస్తోంది...',
      error: 'డేటా లోడ్ చేయడంలో లోపం',
      refresh: 'రిఫ్రెష్'
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      totalSales: 'कुल बिक्रय',
      totalPending: 'कुल बकाया राशि',
      totalCustomers: 'कुल ग्राहक',
      loading: 'लोड हो रहा है...',
      error: 'डेटा लोड करने में त्रुटि',
      refresh: 'रीफ्रेश करें'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.stats || response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
      <div className="main-content">
        <div className="top-bar">          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>          <h1>{t.dashboard}</h1>
          <select value={language} onChange={handleLanguageChange} className="language-selector">
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {error && <div className="error-banner">{t.error}: {error}</div>}

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-icon sales">📊</div>
            <div className="card-content">
              <p className="card-label">{t.totalSales}</p>
              <p className="card-value">
                {loading ? t.loading : `₹ ${dashboardData.totalSales?.toLocaleString('en-IN') || 0}`}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-icon pending">⏳</div>
            <div className="card-content">
              <p className="card-label">{t.totalPending}</p>
              <p className="card-value">
                {loading ? t.loading : `₹ ${dashboardData.totalPending?.toLocaleString('en-IN') || 0}`}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-icon customers">👥</div>
            <div className="card-content">
              <p className="card-label">{t.totalCustomers}</p>
              <p className="card-value">
                {loading ? t.loading : dashboardData.totalCustomers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="refresh-section">
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            {loading ? 'Refreshing...' : t.refresh}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
