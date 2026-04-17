import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API_URL from '../utils/apiConfig';
import './Pages.css';

const Settings = ({ setIsAuthenticated }) => {
  const [language, setLanguage] = useState('en');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const translations = {
    en: { settings: 'Settings', changePassword: 'Change Password', currentPassword: 'Current Password',
      newPassword: 'New Password', confirmPassword: 'Confirm Password', update: 'Update Password', 
      error: 'Error', success: 'Password changed successfully!' },
    te: { settings: 'సెట్టింగ్‌లు', changePassword: 'పాస్‌వర్డ్ మార్చండి', currentPassword: 'ప్రస్తుత పాస్‌వర్డ్',
      newPassword: 'కొత్త పాస్‌వర్డ్', confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి', update: 'పాస్‌వర్డ్ నవీకరించండి',
      error: 'లోపం', success: 'పాస్‌వర్డ్ విజయవంతంగా మార్చబడింది!' },
    hi: { settings: 'सेटिंग्स', changePassword: 'पासवर्ड बदलें', currentPassword: 'वर्तमान पासवर्ड',
      newPassword: 'नया पासवर्ड', confirmPassword: 'पासवर्ड की पुष्टि करें', update: 'पासवर्ड अपडेट करें',
      error: 'त्रुटि', success: 'पासवर्ड सफलतापूर्वक बदल दिया गया!' }
  };

  const t = translations[language] || translations.en;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(t.success);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} />
      <div className="main-content">
        <div className="top-bar">
          <h1>{t.settings}</h1>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-selector">
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div className="page-card">
          <h2>{t.changePassword}</h2>
          
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label>{t.currentPassword}</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.newPassword}</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.confirmPassword}</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : t.update}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
