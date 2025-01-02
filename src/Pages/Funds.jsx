import React, { useState } from 'react';
import './Funds.css'

const Funds = () => {
  // Sample transaction data in state
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-12-01', amount: 100, type: 'Deposit' },
    { id: 2, date: '2024-12-02', amount: 50, type: 'Withdraw' },
    { id: 3, date: '2024-12-03', amount: 200, type: 'Deposit' },
  ]);

  return (
    <div>
         Funds
    </div>
  );
};

export default Funds;
