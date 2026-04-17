import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './Pages.css';

const CustomerHistory = () => {
  const [language, setLanguage] = useState('en');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPaidAmount, setEditPaidAmount] = useState(0);

  // ✅ NEW STATES (SEARCH UPGRADE)
  const [searchName, setSearchName] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const translations = {
    en: { 
      customerHistory: 'Customer History', 
      selectCustomer: 'Select Customer', 
      bills: 'Bills', 
      noData: 'No data available', 
      billNumber: 'Bill Number',
      date: 'Date', 
      name: 'Name',
      items: 'Items',
      productName: 'Product Name',
      subtotal: 'Subtotal',
      paidAmount: 'Paid Amount',
      pendingAmount: 'Pending Amount',
      grandTotal: 'Grand Total',
      amount: 'Amount', 
      village: 'Village'
    },
    te: { 
      customerHistory: 'కస్టమర్ హిస్టరీ', 
      selectCustomer: 'కస్టమర్‌ను ఎంచుకోండి', 
      bills: 'బిల్లులు', 
      noData: 'డేటా లేదు', 
      billNumber: 'బిల్ నంబర్',
      date: 'తేదీ', 
      name: 'పేరు',
      items: 'సరుకులు',
      productName: 'సరుకు పేరు',
      subtotal: 'ఉపమొత్తం',
      paidAmount: 'చెల్లిన మొత్తం',
      pendingAmount: 'బకాయి మొత్తం',
      grandTotal: 'మొత్తం',
      amount: 'మొత్తం', 
      village: 'గ్రామం'
    },
    hi: { 
      customerHistory: 'ग्राहक इतिहास', 
      selectCustomer: 'ग्राहक चुनें', 
      bills: 'बिल', 
      noData: 'कोई डेटा नहीं', 
      billNumber: 'बिल नंबर',
      date: 'तारीख', 
      name: 'नाम',
      items: 'वस्तुएं',
      productName: 'उत्पाद का नाम',
      subtotal: 'उप-कुल',
      paidAmount: 'भुगतान की गई राशि',
      pendingAmount: 'बकाया राशि',
      grandTotal: 'कुल राशि',
      amount: 'राशि', 
      village: 'गाँव'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.accounts || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSelectCustomer = async (customerName) => {
  setSelectedCustomer(customerName);
  setLoading(true);

  try {
    const token = localStorage.getItem('token');

    // ✅ get all customers with same name
    const matchedCustomers = customers.filter(
      c => c.customerName === customerName
    );

    let allBills = [];

    for (let customer of matchedCustomers) {
      const response = await axios.get(
        `http://localhost:5000/api/bills/customer/${customer._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      allBills = [...allBills, ...(response.data.bills || [])];
    }

    setBills(allBills);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  // ✅ LIVE SEARCH
  const handleSearchChange = (value) => {
    setSearchName(value);

    if (!value.trim()) {
      setFilteredCustomers([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = customers.filter(c =>
      c.customerName.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCustomers(filtered);
    setShowSuggestions(true);
  };
// ✅ ADD HERE (~line 155)
  // ✅ SELECT FROM SUGGESTION
  const handleSelectSuggestion = async (customer) => {
    setSearchName(customer.customerName);
    setShowSuggestions(false);
    setSelectedCustomer(customer.customerName);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/bills/customer/${customer._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBills(response.data.bills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bill) => {
    setEditingId(bill._id);
    setEditPaidAmount(bill.paidAmount || 0);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (bill) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bills/${bill._id}`,
        { paidAmount: parseFloat(editPaidAmount) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingId(null);
      if (selectedCustomer) {
        await handleSelectCustomer(selectedCustomer);
      }
    } catch (err) {
      console.error('Error saving bill:', err);
    }
  };

  const handleDelete = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bills/${billId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedCustomer) {
        await handleSelectCustomer(selectedCustomer);
      }
    } catch (err) {
      console.error('Error deleting bill:', err);
    }
  };

  const downloadBillHTML = (bill) => {
    const billHTML = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #333; color: white; }
          </style>
        </head>
        <body>
          <h1>Bill Receipt</h1>
          <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
          <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${bill.customerName}</p>
          <p><strong>Village:</strong> ${bill.village || 'N/A'}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items?.map(item => `
                <tr>
                  <td>${item.product || item.name || 'Item'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>₹ ${item.price?.toFixed(2) ?? 0}</td>
                  <td>₹ ${(item.total || (item.price * item.quantity)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h3>Subtotal: ₹ ${bill.subtotal?.toFixed(2) ?? '0.00'}</h3>
          <h3>Paid Amount: ₹ ${bill.paidAmount?.toFixed(2) ?? '0.00'}</h3>
          <h3>Pending Amount: ₹ ${bill.pendingAmount?.toFixed(2) ?? '0.00'}</h3>
          <h3>Grand Total: ₹ ${bill.grandTotal?.toFixed(2) ?? '0.00'}</h3>
        </body>
      </html>
    `;

    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${bill.billNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} />
      <div className="main-content">
        <div className="top-bar">
          <h1>{t.customerHistory}</h1>
        </div>

        <div className="page-card">

          {/* ✅ SEARCH BOX */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Search Customer</label>
            <input
              type="text"
              placeholder="Type name..."
              value={searchName}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ padding: '10px', width: '100%' }}
            />

            {showSuggestions && filteredCustomers.length > 0 && (
              <div style={{
                position: 'absolute',
                background: '#fff',
                border: '1px solid #ddd',
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000
              }}>
                {filteredCustomers.map(c => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectSuggestion(c)}
                    style={{ padding: '10px', cursor: 'pointer' }}
                  >
                    <strong>{c.customerName}</strong><br />
                    <small>{c.phone} | {c.village}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OLD DROPDOWN (kept safe) */}
          <div className="form-group">
            <label>{t.selectCustomer}</label>
            <select value={selectedCustomer} onChange={(e) => handleSelectCustomer(e.target.value)}>
              <option value="">-- {t.selectCustomer} --</option>
              {[...new Map(customers.map(c => [c.customerName, c])).values()]
  .map(c => (
    <option key={c.customerName} value={c.customerName}>
      {c.customerName}
    </option>
))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="bills-table-container">
              <h2>{t.bills}</h2>

              {bills.length === 0 ? (
                <p>{t.noData}</p>
              ) : (
                <table className="bills-table">
                  <thead>
                    <tr>
                      <th>{t.billNumber}</th>
                      <th>{t.name}</th>
                      <th>{t.date}</th>
                      <th>{t.village}</th>
                      <th>{t.items}</th>
                      <th>{t.productName}</th>
                      <th>{t.subtotal}</th>
                      <th>{t.paidAmount}</th>
                      <th>{t.pendingAmount}</th>
                      <th>{t.grandTotal}</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => {
                      const pendingValue = editingId === bill._id ? bill.grandTotal - editPaidAmount : bill.pendingAmount;
                      const productNames = bill.items?.map(item => item.product || item.name || 'N/A').join(', ') || 'N/A';

                      return (
                        <tr key={bill._id}>
                          <td>{bill.billNumber}</td>
                          <td>{bill.customerName}</td>
                          <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                          <td>{bill.village}</td>
                          <td>{bill.items?.length}</td>
                          <td>{productNames}</td>
                          <td>₹ {bill.subtotal}</td>
                          <td>
                            {editingId === bill._id ? (
                              <input
                                type="number"
                                value={editPaidAmount}
                                onChange={(e) => setEditPaidAmount(parseFloat(e.target.value) || 0)}
                                style={{ width: '100px' }}
                              />
                            ) : (
                              `₹ ${bill.paidAmount}`
                            )}
                          </td>
                          <td>₹ {pendingValue}</td>
                          <td>₹ {bill.grandTotal}</td>
                          <td>
                            {editingId === bill._id ? (
                              <>
                                <button className="table-button save" onClick={() => handleSave(bill)}>Save</button>
                                <button className="table-button cancel" onClick={handleCancel}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="table-button edit" onClick={() => handleEdit(bill)}>Edit</button>
                                <button className="table-button secondary" onClick={() => handleDelete(bill._id)}>Delete</button>
                                <button className="table-button download" onClick={() => downloadBillHTML(bill)}>Download</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;