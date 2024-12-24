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
        <div className="form-container">
        <h2 className="funds-form-title">What operations do you want to take </h2>
        {/* {error && <div className="error-message">{error}</div>} */}
        <form  className="fund-form">
          <div className="form-group">
            <label className="Deposit-form-label" htmlFor="deposit">Deposit</label>
            <input 
              className="form-input" 
              type="number"
              name="deposit" 
              id="deposit"
              placeholder="Deposit"
            //   value={formData.email}
            //   onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Withdraw</label>
            <input
              className="form-input"
              type="number" 
              name="withdraw"
              id="witdraw"
              placeholder="Witdraw"
            //   value={formData.password}
            //   onChange={handleChange}
              required
            />
          </div>
          <button type="submit" id="loginButton" className="login-form-button">
            Deposit
          </button>
          <button type="submit" id="loginButton" className="withdraw-form-button">
            Withdraw
          </button>
        </form>
      
       
      </div>
      <h1>Funds</h1>
      <table>
        <thead>
          <tr className="table-row">
            <th>SL</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={transaction.id}>
              <td>{index + 1}</td> {/* Serial Number */}
              <td>{new Date(transaction.date).toLocaleDateString()}</td> {/* Date */}
              <td>{transaction.amount.toFixed(2)}</td> {/* Amount with 2 decimal places */}
              <td>{transaction.type}</td> {/* Type (Deposit/Withdraw) */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Funds;
