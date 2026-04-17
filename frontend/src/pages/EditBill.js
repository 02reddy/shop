import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import API_URL from '../utils/apiConfig';
import { useParams, useNavigate } from 'react-router-dom';
import './Pages.css';

const EditBill = () => {
  const [language, setLanguage] = useState('en');
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: { editBill: 'Edit Bill', loading: 'Loading...', delete: 'Delete Bill', save: 'Save Changes' },
    te: { editBill: 'బిల్లు సవరించండి', loading: 'లోడ్ చేస్తోంది...', delete: 'బిల్లు తొలగించండి', save: 'మార్పులను సేవ్ చేయండి' },
    hi: { editBill: 'बिल संपादित करें', loading: 'लोड हो रहा है...', delete: 'बिल हटाएं', save: 'परिवर्तन सहेजें' }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBill(response.data.bill || response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/customer-history');
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} />
      <div className="main-content">
        <div className="top-bar">
          <h1>{t.editBill}</h1>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-selector">
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div className="page-card">
          {loading ? (
            <p>{t.loading}</p>
          ) : bill ? (
            <>
              <h2>Bill ID: {bill._id}</h2>
              <p>Customer: {bill.customerName}</p>
              <p>Total: ₹ {bill.grandTotal?.toFixed(2)}</p>
              <div className="form-actions">
                <button className="save-btn">{t.save}</button>
                <button className="delete-btn" onClick={handleDelete}>{t.delete}</button>
              </div>
            </>
          ) : (
            <p>Bill not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBill;
