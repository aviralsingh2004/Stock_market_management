import React, { useState, useEffect } from 'react';
import './home.css';
import Navbar from '../Components/Navbar/Navbar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Home = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load company data');
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:4000/api/historical/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      const data = await response.json();
      setHistoricalData(data);
      setSelectedCompany(symbol);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCompanySelect = (symbol) => {
    fetchHistoricalData(symbol);
  };

  const filteredCompanies = companies.filter(company =>
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = historicalData ? {
    labels: historicalData.map(data => new Date(data.date).toLocaleDateString()),
    datasets: [
      {
        label: `${selectedCompany} Stock Price`,
        data: historicalData.map(data => data.close),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Price History'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <Navbar />
      <h1>Stock Market Management</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by company symbol..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {historicalData && (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Date</th>
              <th>Open ($)</th>
              <th>High ($)</th>
              <th>Low ($)</th>
              <th>Close ($)</th>
              <th>Volume</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <tr key={index}>
                <td>{company.symbol}</td>
                <td>{new Date(company.date).toLocaleDateString()}</td>
                <td>{company.open.toFixed(2)}</td>
                <td>{company.high.toFixed(2)}</td>
                <td>{company.low.toFixed(2)}</td>
                <td>{company.close.toFixed(2)}</td>
                <td>{company.volume.toLocaleString()}</td>
                <td>
                  <button 
                    className="view-graph-btn"
                    onClick={() => handleCompanySelect(company.symbol)}
                  >
                    View Graph
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
