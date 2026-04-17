import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './NewBill.css';

const NewBill = () => {
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    village: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    items: [{ product: '', company: '', unit: 'ML', packageSize: '', quantity: 0, price: 0 }],
    paidAmount: 0
  });
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billData, setBillData] = useState(null);
  
  // Autocomplete states
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [activeProductIndex, setActiveProductIndex] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isTypingCustomer, setIsTypingCustomer] = useState(false);

  const unitOptions = ['ML', 'KG', 'L', 'Pieces', 'Box', 'Bottle', 'Dozen', 'Gram'];

  const translations = {
    en: {
      newBill: 'New Bill',
      customer: 'Customer',
      customerName: 'Customer Name',
      phone: 'Phone',
      village: 'Village',
      selectCustomer: 'Select or enter customer name',
      product: 'Product',
      company: 'Company',
      unit: 'Unit',
      packageSize: 'Package Size',
      price: 'Price',
      quantity: 'Quantity',
      addItem: 'Add Item',
      items: 'Items',
      subtotal: 'Subtotal',
      total: 'Total',
      paidAmount: 'Paid Amount',
      pending: 'Pending',
      saveBill: 'Save Bill',
      downloadBill: 'Download Bill',
      printBill: 'Print Bill',
      cancel: 'Cancel',
      loading: 'Loading...',
      success: 'Bill saved successfully!',
      error: 'Error saving bill',
      pleaseEnter: 'Please enter required fields',
      date: 'Purchase Date'
    },
    te: {
      newBill: 'కొత్త బిల్లు',
      customer: 'కస్టమర్',
      customerName: 'కస్టమర్ పేరు',
      phone: 'ఫోన్',
      village: 'గ్రామం',
      selectCustomer: 'కస్టమర్‌ను ఎంచుకుండి లేదా నమోదు చేయండి',
      product: 'ఉత్పత్తి',
      company: 'కంపెనీ',
      unit: 'యూనిట్',
      packageSize: 'ప్యాకేజీ సైజ్',
      price: 'ధర',
      quantity: 'పరిమాణం',
      addItem: 'అంశం జోడించండి',
      items: 'సరుకులు',
      subtotal: 'ఉపమొత్తం',
      total: 'మొత్తం',
      paidAmount: 'చెల్లిన మొత్తం',
      pending: 'బకాయి',
      saveBill: 'బిల్లు సేవ్ చేయండి',
      downloadBill: 'బిల్లు డౌన్లోడ్ చేయండి',
      printBill: 'బిల్లు ముద్రించండి',
      cancel: 'రద్దు చేయండి',
      loading: 'లోడ్ చేస్తోంది...',
      success: 'బిల్లు విజయవంతంగా సేవ్ చేయబడింది!',
      error: 'బిల్లు సేవ్ చేయడంలో లోపం',
      pleaseEnter: 'దయచేసి అవసరమైన ఫీల్డ్‌లను నమోదు చేయండి',
      date: 'కొనుగోలు తేదీ'
    },
    hi: {
      newBill: 'नया बिल',
      customer: 'ग्राहक',
      customerName: 'ग्राहक का नाम',
      phone: 'फोन',
      village: 'गांव',
      selectCustomer: 'ग्राहक का चयन करें या नाम दर्ज करें',
      product: 'उत्पाद',
      company: 'कंपनी',
      unit: 'यूनिट',
      packageSize: 'पैकेज आकार',
      price: 'कीमत',
      quantity: 'मात्रा',
      addItem: 'आइटम जोड़ें',
      items: 'वस्तुएं',
      subtotal: 'उप-कुल',
      total: 'कुल',
      paidAmount: 'भुगतान की गई राशि',
      pending: 'बकाया',
      saveBill: 'बिल सहेजें',
      downloadBill: 'बिल डाउनलोड करें',
      printBill: 'बिल प्रिंट करें',
      cancel: 'रद्द करें',
      loading: 'लोड हो रहा है...',
      success: 'बिल सफलतापूर्वक सहेजा गया!',
      error: 'बिल सहेजने में त्रुटि',
      pleaseEnter: 'कृपया आवश्यक फील्ड दर्ज करें',
      date: 'खरीद तारीख'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchCustomers();
    fetchBills();
  }, []);

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

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(response.data.bills || []);
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  // Get unique values for autocomplete
  const getUniquePhones = () => {
    const phones = bills.map(bill => bill.phone).filter(Boolean);
    return [...new Set(phones)];
  };

  const getUniqueVillages = () => {
    const villages = bills.map(bill => bill.village).filter(Boolean);
    return [...new Set(villages)];
  };

  const getUniqueCompanies = () => {
    const companies = [];
    bills.forEach(bill => {
      bill.items?.forEach(item => {
        if (item.company) companies.push(item.company);
      });
    });
    return [...new Set(companies)];
  };

  const getUniqueProducts = () => {
    const products = [];
    bills.forEach(bill => {
      bill.items?.forEach(item => {
        if (item.product) products.push(item.product);
      });
    });
    return [...new Set(products)];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    const numericValue = (name === 'paidAmount') ? (value === '' ? 0 : Number(value)) : value;
    setFormData(prev => ({ ...prev, [name]: numericValue }));

    // Handle autocomplete suggestions
    if (name === 'customerName') {
      setIsTypingCustomer(true);
      setShowCustomerSuggestions(true); // Always show suggestions when typing
      
      if (value && value.length > 0) {
        // Filter customers by name
        const searchValue = value.toLowerCase();
        const filtered = customers
          .filter(c => c.customerName && c.customerName.toLowerCase().includes(searchValue))
          .map(c => c.customerName);
        const uniqueNames = [...new Set(filtered)];
        setFilteredCustomers(uniqueNames);
      } else {
        // Show all customer names when field is empty
        const allNames = customers.map(c => c.customerName).filter(Boolean);
        setFilteredCustomers([...new Set(allNames)]);
      }
    }

    if (name === 'phone') {
      if (value.length > 0) {
        const uniquePhones = getUniquePhones();
        const filtered = uniquePhones.filter(p => p.includes(value));
        setFilteredPhones(filtered);
        setShowPhoneSuggestions(true);
      } else {
        setShowPhoneSuggestions(false);
      }
    }

    if (name === 'company') {
      if (value.length > 0) {
        const uniqueVillages = getUniqueVillages();
        const filtered = uniqueVillages.filter(c => c.toLowerCase().includes(value.toLowerCase()));
        setFilteredCompanies(filtered);
        setShowCompanySuggestions(true);
      } else {
        setShowCompanySuggestions(false);
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));

    // Handle product autocomplete
    if (field === 'product') {
      if (value.length > 0) {
        const uniqueProducts = getUniqueProducts();
        const filtered = uniqueProducts.filter(p => p.toLowerCase().includes(value.toLowerCase()));
        setFilteredProducts(filtered);
        setActiveProductIndex(index);
      }
    }
  };

  const getPackageSizeOptions = (unit) => {
    switch(unit) {
      case 'KG':
        return ['250gm', '500gm', '750gm', '1000gm', '1250gm', '1500gm', '2000gm', 'Custom'];
      case 'ML':
        return ['100ml', '250ml', '500ml', '750ml', '1000ml', '1500ml', '2000ml', 'Custom'];
      case 'L':
        return ['0.5L', '1L', '1.5L', '2L', '2.5L', '5L', 'Custom'];
      case 'Gram':
        return ['50gm', '100gm', '250gm', '500gm', 'Custom'];
      default:
        return ['Custom'];
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', company: '', unit: 'ML', packageSize: '', quantity: 0, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculatePending = () => {
    return Math.max(0, calculateTotal() - formData.paidAmount);
  };

  const generateBillHTML = () => {
    const total = calculateTotal();
    const pending = calculatePending();

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 5px 0; }
            .details { margin: 20px 0; }
            .details p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #667eea; color: white; }
            .totals { text-align: right; margin-top: 20px; font-size: 16px; font-weight: bold; }
            .totals p { margin: 5px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Shop Management System</h1>
            <h2>Bill Receipt</h2>
          </div>
          
          <div class="details">
            <p><strong>Date:</strong> ${new Date(formData.purchaseDate).toLocaleDateString()}</p>
            <p><strong>Customer Name:</strong> ${formData.customerName}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Village:</strong> ${formData.village || 'N/A'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>Unit</th>
                <th>Package Size</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${formData.items.map(item => `
                <tr>
                  <td>${item.product}</td>
                  <td>${item.company || 'N/A'}</td>
                  <td>${item.unit}</td>
                  <td>${item.packageSize || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>₹ ${item.price.toFixed(2)}</td>
                  <td>₹ ${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹ ${total.toFixed(2)}</p>
            <p>Paid Amount: ₹ ${formData.paidAmount.toFixed(2)}</p>
            <p style="color: red;">Pending: ₹ ${pending.toFixed(2)}</p>
            <p style="color: blue; font-size: 20px;">Grand Total: ₹ ${total.toFixed(2)}</p>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadBill = () => {
    const html = generateBillHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-${formData.customerName}-${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSelectCustomer = (name) => {
    setFormData(prev => ({ ...prev, customerName: name }));
    setShowCustomerSuggestions(false);
    setIsTypingCustomer(false);
  };

  const handleSelectPhone = (phone) => {
    setFormData(prev => ({ ...prev, phone }));
    setShowPhoneSuggestions(false);
  };

  const handleSelectCompany = (village) => {
    setFormData(prev => ({ ...prev, village }));
    setShowCompanySuggestions(false);
  };

  const handleSelectProduct = (product, index) => {
    const newItems = [...formData.items];
    newItems[index].product = product;
    setFormData(prev => ({ ...prev, items: newItems }));
    setActiveProductIndex(null);
  };

  const handlePrintBill = () => {
    const html = generateBillHTML();
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.customerName) {
      setError('Please enter customer name');
      return;
    }
    if (!formData.phone) {
      setError('Please enter phone number');
      return;
    }
    if (!formData.village) {
      setError('Please enter village');
      return;
    }
    if (formData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    
    // Check if at least one item has product name
    const hasValidItems = formData.items.some(item => item.product && item.product.trim() !== '');
    if (!hasValidItems) {
      setError('Please add at least one product to the items');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const billData = {
        customerName: formData.customerName,
        phone: formData.phone,
        village: formData.village,
        purchaseDate: formData.purchaseDate,
        items: formData.items,
        subtotal: calculateTotal(),
        grandTotal: calculateTotal(),
        paidAmount: formData.paidAmount,
        pendingAmount: calculatePending()
      };

      console.log('Sending bill data:', billData);
      console.log('Token:', token);

      await axios.post('http://localhost:5000/api/bills', billData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(t.success);
      setFormData({
        customerName: '',
        phone: '',
        village: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        items: [{ product: '', company: '', unit: 'ML', packageSize: '', quantity: 0, price: 0 }],
        paidAmount: 0
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar language={language} />
      <div className="main-content">
        <div className="top-bar">
          <h1>{t.newBill}</h1>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-selector">
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form className="bill-form" onSubmit={handleSaveBill}>
          <div className="form-section">
            <h2>{t.customer}</h2>
            <div className="form-grid">
              <div className="form-group autocomplete-group">
                <label>{t.customerName}</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setIsTypingCustomer(true);
                    setShowCustomerSuggestions(true);
                    if (!formData.customerName || formData.customerName.length === 0) {
                      const allNames = customers.map(c => c.customerName).filter(Boolean);
                      setFilteredCustomers([...new Set(allNames)]);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowCustomerSuggestions(false);
                      setIsTypingCustomer(false);
                    }, 200);
                  }}
                  placeholder={t.selectCustomer}
                  autoComplete="off"
                />
                {showCustomerSuggestions && (
                  <div className="suggestions-dropdown">
                    {filteredCustomers && filteredCustomers.length > 0 ? (
                      filteredCustomers.map((name, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur from firing
                            handleSelectCustomer(name);
                          }}
                          role="option"
                          aria-label={name}
                        >
                          {name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px 15px', color: '#999', textAlign: 'center' }}>
                        {customers.length === 0 ? 'No customers available' : 'No matching customers'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group autocomplete-group">
                <label>{t.phone}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => formData.phone.length > 0 && setShowPhoneSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPhoneSuggestions(false), 200)}
                  placeholder="10 digit mobile"
                />
                {showPhoneSuggestions && filteredPhones.length > 0 && (
                  <div className="suggestions-dropdown">
                    {filteredPhones.map((phone, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectPhone(phone);
                        }}
                      >
                        {phone}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group autocomplete-group">
                <label>{t.village}</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  onFocus={() => formData.village.length > 0 && setShowCompanySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                  placeholder="Village name"
                />
                {showCompanySuggestions && filteredCompanies.length > 0 && (
                  <div className="suggestions-dropdown">
                    {filteredCompanies.map((village, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCompany(village);
                        }}
                      >
                        {village}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t.date}</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2>{t.items}</h2>
              {formData.village && (
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  <strong>Village:</strong> {formData.village}
                </p>
              )}
            </div>
            <div className="items-table">
              <div className="table-header">
                <div className="col-1">{t.product}</div>
                <div className="col-2a">{t.company}</div>
                <div className="col-2">{t.unit}</div>
                <div className="col-2b">{t.packageSize}</div>
                <div className="col-3">{t.quantity}</div>
                <div className="col-4">{t.price}</div>
                <div className="col-5">Total</div>
                <div className="col-6">Action</div>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="table-row">
                  <div className="col-1 product-autocomplete">
                    <input
                      type="text"
                      placeholder={t.product}
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    />
                    {activeProductIndex === index && filteredProducts.length > 0 && (
                      <div className="suggestions-dropdown">
                        {filteredProducts.map((product, idx) => (
                          <div
                            key={idx}
                            className="suggestion-item"
                            onClick={() => handleSelectProduct(product, index)}
                          >
                            {product}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={t.company}
                    value={item.company}
                    onChange={(e) => handleItemChange(index, 'company', e.target.value)}
                    className="col-2a"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                    className="col-2"
                  >
                    {unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <div className="col-2b">
                    {getPackageSizeOptions(item.unit).includes('Custom') ? (
                      <>
                        <select
                          value={item.packageSize}
                          onChange={(e) => {
                            if (e.target.value === 'Custom') {
                              handleItemChange(index, 'packageSize', '');
                            } else {
                              handleItemChange(index, 'packageSize', e.target.value);
                            }
                          }}
                          style={{ width: '100%', marginBottom: item.packageSize && !getPackageSizeOptions(item.unit).includes(item.packageSize) ? '5px' : '0' }}
                        >
                          <option value="">Select</option>
                          {getPackageSizeOptions(item.unit).slice(0, -1).map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                          <option value="Custom">Custom</option>
                        </select>
                        {item.packageSize === 'Custom' || (item.packageSize && !getPackageSizeOptions(item.unit).includes(item.packageSize)) ? (
                          <input
                            type="text"
                            placeholder="Enter size"
                            value={item.packageSize && !getPackageSizeOptions(item.unit).slice(0, -1).includes(item.packageSize) ? item.packageSize : ''}
                            onChange={(e) => handleItemChange(index, 'packageSize', e.target.value)}
                            style={{ width: '100%' }}
                          />
                        ) : null}
                      </>
                    ) : (
                      <input
                        type="text"
                        placeholder={t.packageSize}
                        value={item.packageSize}
                        onChange={(e) => handleItemChange(index, 'packageSize', e.target.value)}
                      />
                    )}
                  </div>
                  <input
                    type="number"
                    placeholder={t.quantity}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="col-3"
                  />
                  <input
                    type="number"
                    placeholder={t.price}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="col-4"
                  />
                  <div className="col-5">₹ {(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    type="button"
                    className="col-6 remove-btn"
                    onClick={() => removeItem(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-item-btn" onClick={addItem}>
              + {t.addItem}
            </button>
          </div>

          <div className="form-section">
            <h2>{t.total}</h2>
            <div className="totals-grid">
              <div className="total-box">
                <p className="total-label">{t.subtotal}</p>
                <p className="total-value">₹ {calculateTotal().toFixed(2)}</p>
              </div>
              <div className="total-box">
                <p className="total-label">{t.paidAmount}</p>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  className="paid-input"
                />
              </div>
              <div className="total-box pending">
                <p className="total-label">{t.pending}</p>
                <p className="total-value">₹ {calculatePending().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? t.loading : t.saveBill}
            </button>
            <button type="button" className="download-btn" onClick={handleDownloadBill}>
              📥 {t.downloadBill}
            </button>
            <button type="button" className="print-btn" onClick={handlePrintBill}>
              🖨️ {t.printBill}
            </button>
            <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBill;
