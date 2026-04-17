import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Pages.css';

const KatthaAccounts = () => {
  const [language, setLanguage] = useState('en');
  const [customers, setCustomers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [summary, setSummary] = useState({
    totalPurchase: 0,
    totalPaid: 0,
    totalBalance: 0,
    purchaseCount: 0
  });
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      katthaAccounts: 'Kattha Accounts',
      searchCustomer: 'Search Customer',
      noData: 'No customer selected',
      totalPurchase: 'Total Purchased',
      totalPaid: 'Total Paid',
      totalBalance: 'Total Balance',
      purchases: 'Purchases'
    },
    te: {
      katthaAccounts: 'ఖత్తా ఖాతాలు',
      searchCustomer: 'కస్టమర్‌ని శోధించండి',
      noData: 'ఏ ఖాతాలు చేర్చబడలేదు',
      totalPurchase: 'మొత్తం కొనుగోలు',
      totalPaid: 'మొత్తం చెల్లింపు',
      totalBalance: 'మొత్తం బకాయి',
      purchases: 'కొనుగోళ్లు'
    },
    hi: {
      katthaAccounts: 'खत्ता खाते',
      searchCustomer: 'ग्राहक खोजें',
      noData: 'कोई ग्राहक चयनित नहीं',
      totalPurchase: 'कुल खरीदी',
      totalPaid: 'कुल भुगतान',
      totalBalance: 'कुल शेष',
      purchases: 'खरीदारी'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    customers.forEach((customer) => {
      if (customer.customerName && !map.has(customer.customerName)) {
        map.set(customer.customerName, customer);
      }
    });
    return Array.from(map.values());
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.accounts || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchCustomerSummary = async (customerName) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const matchedCustomers = customers.filter(
        (customer) => customer.customerName === customerName
      );

      let bills = [];
      for (const customer of matchedCustomers) {
        const response = await axios.get(
          `http://localhost:5000/api/bills/customer/${customer._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        bills = bills.concat(response.data.bills || []);
      }

      const totalPurchase = bills.reduce(
        (sum, bill) => sum + (bill.grandTotal || bill.subtotal || 0),
        0
      );
      const totalPaid = bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
      const totalBalance = bills.reduce((sum, bill) => sum + (bill.pendingAmount || 0), 0);
      const purchaseCount = bills.length;

      setSummary({ totalPurchase, totalPaid, totalBalance, purchaseCount });
    } catch (err) {
      console.error('Error fetching customer summary:', err);
      setSummary({ totalPurchase: 0, totalPaid: 0, totalBalance: 0, purchaseCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchName(value);
    if (!value.trim()) {
      setFilteredCustomers([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = uniqueCustomers.filter((customer) =>
      customer.customerName.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCustomers(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelectSuggestion = async (customer) => {
    setSearchName(customer.customerName);
    setShowSuggestions(false);
    setSelectedCustomer(customer);
    await fetchCustomerSummary(customer.customerName);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} />
      <div className="main-content">
        <div className="top-bar">
          <h1>{t.katthaAccounts}</h1>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div className="page-card">
          <div className="form-group" style={{ position: 'relative' }}>
            <label>{t.searchCustomer}</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t.searchCustomer}
              style={{ width: '100%', padding: '10px' }}
            />
            {showSuggestions && filteredCustomers.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  zIndex: 1000,
                  maxHeight: 240,
                  overflowY: 'auto'
                }}
              >
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleSelectSuggestion(customer)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{customer.customerName}</div>
                    <small>{customer.phone || customer.village || ''}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="customer-summary" style={{ marginTop: 24 }}>
            {loading ? (
              <p>Loading...</p>
            ) : !selectedCustomer ? (
              <p>{t.noData}</p>
            ) : (
              <div>
                <h2>{selectedCustomer.customerName}</h2>
                <p style={{ marginBottom: 16 }}>
                  {t.purchases}: {summary.purchaseCount}
                </p>
                <div
                  style={{
                    display: 'grid',
                    gap: 16,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
                  }}
                >
                  <div
                    className="summary-card"
                    style={{ background: '#e6f9e6', color: '#116611' }}
                  >
                    <strong>{t.totalPurchase}</strong>
                    <p>₹ {summary.totalPurchase.toFixed(2)}</p>
                  </div>
                  <div
                    className="summary-card"
                    style={{ background: '#f5f5f5', color: '#111' }}
                  >
                    <strong>{t.totalPaid}</strong>
                    <p>₹ {summary.totalPaid.toFixed(2)}</p>
                  </div>
                  <div
                    className="summary-card"
                    style={{ background: '#fde6e6', color: '#c62828' }}
                  >
                    <strong>{t.totalBalance}</strong>
                    <p>₹ {summary.totalBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KatthaAccounts;