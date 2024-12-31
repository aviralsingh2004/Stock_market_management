import React, { useState, useEffect, useRef } from 'react';
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
  const chartRef = useRef(null); // Ref for chart container

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
      scrollToChart(); // Scroll to the chart after selecting a company
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data');
    }
  };

  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== '') {
      setHistoricalData(null); // Hide chart during search
      setSelectedCompany(null);
    }
  };

  const handleCompanySelect = (symbol) => {
    fetchHistoricalData(symbol);
  };

  const filteredCompanies = companies.filter((company) =>
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = historicalData
    ? {
        labels: historicalData.map((data) => new Date(data.date).toLocaleDateString()),
        datasets: [
          {
            label: `${selectedCompany} Stock Price`,
            data: historicalData.map((data) => data.close),
            fill: true,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Price History',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bg-black">
      <Navbar />
      <div className="mt-5 mb-5 font-bold text-4xl">Stock Listing</div>

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
        <div className="chart-container" ref={chartRef}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="bg-transparent p-6 rounded-2xl shadow-md relative z-10 max-w w-full">
        <table className="bg-black rounded-2xl text-white">
          <thead>
            <tr className="bg-transparent">
              <th className="ml-1">Symbol</th>
              <th className="ml-1">Date</th>
              <th className="ml-5">Open ($)</th>
              <th className="ml-1">High ($)</th>
              <th className="ml-1">Low ($)</th>
              <th className="ml-1">Close ($)</th>
              <th className="ml-1">Volume</th>
              <th className="ml-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <tr key={index}>
                <td className="text-white">{company.symbol}</td>
                <td className="text-white">
                  {new Date(company.date).toLocaleDateString()}
                </td>
                <td className="text-white">{company.open.toFixed(2)}</td>
                <td className="text-white">{company.high.toFixed(2)}</td>
                <td className="text-white">{company.low.toFixed(2)}</td>
                <td className="text-white">{company.close.toFixed(2)}</td>
                <td className="text-white">{company.volume.toLocaleString()}</td>
                <td className="text-white">
                  <button
                    className="bg-transparent text-white border py-1 px-2 rounded-lg hover:bg-white hover:text-black transition duration-200"
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
