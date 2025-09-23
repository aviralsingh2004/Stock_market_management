import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register required elements
ChartJS.register(BarElement, ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const [stockinfo, setStockInfo] = useState([]);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [tinfo, settinfo] = useState([]); // Transaction info
  const [ttype, settype] = useState("");
  const [totprof, settotprof] = useState({}); //for total profit
  const [comporf, setcomprof] = useState([]); //for company comparison
  const [stat, setstat] = useState(""); //for profit or loss status
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleUnauthorized = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: location } });
  }, [location, logout, navigate]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, credentials: "include" });

    if (response.status === 401) {
      await handleUnauthorized();
      throw new Error("Unauthorized");
    }

    return response;
  }, [handleUnauthorized]);

  // Debug: Log totprof state changes
  useEffect(() => {
    console.log("totprof state changed:", totprof);
  }, [totprof]);

  useEffect(() => {
    fetchBalance();
    fetchStockInfo();
    fetchTransactionInfo(); // Fetch transaction data on component mount
    fetchTotalprofit();
    fetchComprof();
  }, [ttype, startDate, endDate]);

  const fetchBalance = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:4000/api/users/balance", {
        method: "GET",
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      if (error.message === "Unauthorized") {
        return;
      }
      console.error("Failed to fetch balance:", error);
    }
  };
  const pdfgenerator = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:4000/api/transactions/report", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stock_report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      if (error.message === "Unauthorized") {
        return;
      }
      console.error("Error downloading report:", error);
    }
  };
  const fetchStockInfo = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:4000/api/stocks/portfolio");
      const data = await response.json();

      const stocks = data.stocks || data;
      const filteredData = stocks.filter((stock) => stock.quantity > 0);
      setStockInfo(filteredData);
    } catch (err) {
      if (err.message === "Unauthorized") {
        return;
      }
      console.error("Error fetching stock data:", err);
      setError("Failed to load stock data");
    }
  };

  const fetchTransactionInfo = async () => {
    try {
      let url = "http://localhost:4000/api/transactions";

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error("Failed to get transaction record");
      const data = await response.json();
      settinfo(
        data.map((trans) => ({
          ...trans,
          calculated_amount:
            (trans.quantity === 0 ? 1 : trans.quantity) * trans.total_amount,
        }))
      );
    } catch (error) {
      if (error.message === "Unauthorized") {
        return;
      }
      console.error("Error in fetching transaction history:", error);
      setError("Failed to load transaction history");
    }
  };

  const fetchTotalprofit = async () => {
    try {
      const result = await fetchWithAuth(`http://localhost:4000/api/stocks/profit-loss`);
      if (!result.ok) throw new Error(`Failed to fetch profit/loss history`);

      const data = await result.json();
      settotprof(data.summary || {});
      setstat(data.summary?.status || "");
    } catch (error) {
      if (error.message === "Unauthorized") {
        return;
      }
      console.error("Error in fetching profit loss", error);
    }
  };

  const fetchComprof = async () => {
    try {
      const result = await fetchWithAuth(`http://localhost:4000/api/transactions/profit-loss`);
      if (!result.ok) {
        const errorText = await result.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to get company-wise data");
      }

      const data = await result.json();
      setcomprof(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.message === "Unauthorized") {
        return;
      }
      console.error("Error fetching company comparison data:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 mt-[68px] grid-rows-2 min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 gap-2 p-4">
      <Navbar />
      {/* Top-Left Div (Pie Chart Card) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative border-2 border-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white text-center underline">
            Stocks Owned
          </h2>
          {/* Add Download Report Button */}
          <button
            onClick={pdfgenerator}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Download Report
          </button>
        </div>

        {/* Pie Chart */}
        <div className="flex items-center justify-center min-h-[30vh] pointer-events-auto mt-12">
          {stockinfo.length > 0 ? (
            <Pie
              data={{
                labels: stockinfo.map((stock) => stock.company_name),
                datasets: [
                  {
                    data: stockinfo.map((stock) => stock.quantity),
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#FFB3E6",
                      "#FF6666",
                      "#33CC99",
                      "#6600FF",
                      "#FF3399",
                      "#33CCFF",
                    ],
                    hoverOffset: 4,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      color: "#fff",
                    },
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <p className="text-white">No stock data available.</p>
          )}
        </div>
      </div>

      {/* Top-Right Div (Add your content here) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative border-2 border-blue-500">
        <div className="min-h-[450px] flex flex-col justify-center">
          <div className="text-white mb-4 text-center">
            <span className="font-bold">Status:</span>{" "}
            <span
              className={`font-bold ${
                totprof.status === "Profit" ? "text-green-500" : "text-red-500"
              }`}
            >
              {totprof.status || "N/A"}{" "}
            </span>
            <br />
            <span className="font-bold">Amount:</span>{" "}
            {totprof.amount !== undefined && totprof.amount !== null 
              ? `$${totprof.amount.toFixed(2)}` 
              : "N/A"}
          </div>

          {comporf && comporf.length > 0 ? (
            <div className="flex-grow">
              <Bar
                data={{
                  labels: comporf.map((cmp) => cmp.company_name),
                  datasets: [
                    {
                      label: "Total Invested",
                      data: comporf.map((cmp) => parseFloat(cmp.total_buy_amount) || 0),
                      backgroundColor: "#FF5733", // Total Invested color
                      hoverOffset: 9,
                    },
                    {
                      label: "Total Returns",
                      data: comporf.map((cmp) => parseFloat(cmp.total_sell_amount) || 0),
                      backgroundColor: "#4CAF50", // Total Returns color
                      hoverOffset: 9,
                    },
                    {
                      label: "Realized P&L",
                      data: comporf.map((cmp) => parseFloat(cmp.realized_pnl) || 0),
                      backgroundColor: "#2196F3", // Realized P&L color
                      hoverOffset: 9,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        color: "#fff", // Text color for legend items
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        color: "#fff", // Y-axis labels color
                      },
                    },
                    x: {
                      ticks: {
                        color: "#fff", // X-axis labels color
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-white text-center">
              No data available for company comparison.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Div (Transaction Table) */}
      <div className="border-blue-500 bg-gray-800 p-6 rounded-lg border-2 col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded-md"
              />
            </div>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[50vh]">
          <table className="bg-gradient-to-r from-blue-950 to-black rounded-2xl text-white w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left text-white">
                  <select
                    className="bg-gray-700 text-white p-2 rounded-md"
                    value={ttype || ""}
                    onChange={(e) => settype(e.target.value)}
                  >
                    <option value="">Transaction</option>
                    <option value="Buy_stock">Buy Stock</option>
                    <option value="Sell_stock">Sell Stock</option>
                    <option value="deposited">Deposited</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </th>
                <th className="p-3 text-left text-white">Company Name</th>
                <th className="p-3 text-right text-white">Quantity</th>
                <th className="p-3 text-right text-white">Money Involved</th>
                <th className="p-3 text-right text-white">Date</th>
              </tr>
            </thead>
            <tbody>
              {tinfo.length > 0 ? (
                tinfo
                  .filter(
                    (trans) => ttype === "" || trans.transaction_type === ttype
                  )
                  .map((trans, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-3 text-left text-white">
                        {trans.transaction_type || "Unknown"}
                      </td>
                      <td className="p-3 text-left text-white">
                        {trans.company_name || "N/A"}
                      </td>
                      <td className="p-3 text-center text-white">
                        {trans.quantity || "-"}
                      </td>
                      <td className="p-3 text-left text-white">
                        {trans.calculated_amount.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-3 text-center text-white">
                        {new Date(trans.transaction_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-white">
                    No transactions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

























