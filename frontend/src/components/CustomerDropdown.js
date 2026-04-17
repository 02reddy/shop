// Function to get unique customer names
const getUniqueCustomerNames = (customers) => {
  const names = customers.map(customer => customer.name);
  return [...new Set(names)];
};

// Example usage
const customers = [
  { name: "shashi", date: "2024-01-01" },
  { name: "shashi", date: "2024-01-02" },
  { name: "gopi", date: "2024-01-03" }
];

const uniqueNames = getUniqueCustomerNames(customers);
console.log(uniqueNames); // ["shashi", "gopi"]

// React component example for dropdown
import React, { useState, useEffect } from 'react';

const CustomerDropdown = ({ customers }) => {
  const [uniqueNames, setUniqueNames] = useState([]);

  useEffect(() => {
    const names = customers.map(customer => customer.name);
    const unique = [...new Set(names)];
    setUniqueNames(unique);
  }, [customers]);

  return (
    <select>
      <option value="">Select Customer</option>
      {uniqueNames.map((name, index) => (
        <option key={index} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default CustomerDropdown;