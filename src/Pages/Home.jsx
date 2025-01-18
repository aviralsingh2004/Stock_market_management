import React, { useState, useEffect, useRef } from "react";
import "./home.css";
import Navbar from "../Components/Navbar/Navbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const chartRef = useRef(null); // Ref for chart container

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/companies");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load company data");
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (symbol) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/historical/${symbol}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch historical data");
      }
      const data = await response.json();
      setHistoricalData(data);
      setSelectedCompany(symbol);
      scrollToChart(); // Scroll to the chart after selecting a company
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError("Failed to load historical data");
    }
  };

  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== "") {
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
        labels: historicalData.map((data) =>
          new Date(data.date).toLocaleDateString()
        ),
        datasets: [
          {
            label: `${selectedCompany} Stock Price`,
            data: historicalData.map((data) => data.close),
            fill: true,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Stock Price History",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (loading) return <div className="bg-transparent loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-950">
      <Navbar />
      <div className="pt-[68px] mt-2 z-0">
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

        <div className="bg-transparent p-6 rounded-2xl shadow-md">
          <div className="relative overflow-x-auto rounded-2xl">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full bg-gradient-to-r from-blue-950 to-black text-white table-auto">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">Symbol</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-right">Open ($)</th>
                    <th className="px-6 py-3 text-right">High ($)</th>
                    <th className="px-6 py-3 text-right">Low ($)</th>
                    <th className="px-6 py-3 text-right">Close ($)</th>
                    <th className="px-6 py-3 text-right">Volume</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredCompanies.map((company, index) => (
                    <tr key={index} className="hover:bg-gray-900/50">
                      <td className="px-6 py-4 text-blue-400 text-left">
                        {company.symbol}
                      </td>
                      <td className="px-6 py-4 text-left">
                        {new Date(company.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-white text-right">
                        {company.open.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-white text-right">
                        {company.high.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-white text-right">
                        {company.low.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-white text-right">
                        {company.close.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-white text-right">
                        {company.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-white text-center">
                        <button
                          className="bg-transparent text-white border border-gray-600 py-1 px-4 rounded-lg hover:bg-white hover:text-black transition duration-200"
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
        </div>
      </div>
    </div>
  );
};

export default Home;
