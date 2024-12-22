import React, { useState } from 'react';
import './home.css';
import Navbar from '../Components/Navbar/Navbar';

export const Home = () => {
  const [companies] = useState([
    {
      id: 1,
      name: 'Apple Inc.',
      currentPrice: 173.50,
      dayHigh: 175.20,
      dayLow: 171.80,
    },
    {
      id: 2,
      name: 'Microsoft Corp.',
      currentPrice: 378.85,
      dayHigh: 380.25,
      dayLow: 375.40,
    },
  ]);

  return (
    <div className="container">
      < Navbar />
      <h1>Stock Market Management</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Current Price ($)</th>
              <th>Day High ($)</th>
              <th>Day Low ($)</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>{company.name}</td>
                <td>{company.currentPrice}</td>
                <td>{company.dayHigh}</td>
                <td>{company.dayLow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
