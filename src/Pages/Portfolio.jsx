import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { Chart as ChartJS } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const Portfolio = () => {
  const [stockinfo, setStockInfo] = useState([]);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [tinfo, settinfo] = useState([]); // Transaction info
  const [ttype, settype] = useState("");

  useEffect(() => {
    fetchBalance();
    fetchStockInfo();
    fetchTransactionInfo(); // Fetch transaction data on component mount
    fetchTransactiontype();
  }, [ttype]);

  const fetchBalance = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/user/balance", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch balance");
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchStockInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_stock");
      if (!response.ok) throw new Error("Failed to fetch stock data");
      const data = await response.json();

      // Filter stocks with quantity > 0
      const filteredData = data.filter((stock) => stock.quantity > 0);
      setStockInfo(filteredData);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError("Failed to load stock data");
    }
  };

  const fetchTransactionInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_transaction");
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
      console.error("Error in fetching transaction history:", error);
      setError("Failed to load transaction history");
    }
  };

  const fetchTransactiontype = async () => {
    if (!ttype) return;

    try {
      const result = await fetch(
        `http://localhost:4000/api/know_transaction/${ttype}`
      );
      if (!result.ok)
        throw new Error(`Failed to fetch transaction type: ${ttype}`);

      const data = await result.json();

      if (!data.rows || !Array.isArray(data.rows) || data.rows.length === 0) {
        throw new Error("No transaction data available for this type.");
      }

      settinfo(data.rows);
    } catch (error) {
      console.error("Error in fetching history:", error);
      setError("Failed to load history");
    }
  };

  return (
    <div className="grid grid-cols-2 mt-[68px] grid-rows-2 min-h-screen bg-gray-900 gap-4 p-4">
      <Navbar />
      {/* Top-Left Div (Pie Chart Card) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative border-2 border-blue-500">
        <h2 className="text-2xl font-bold text-white text-center mb-4 underline">
          Stocks Owned
        </h2>

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
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-blue-500">
        <h2 className="text-2xl font-bold text-white text-center mb-4 underline">
          Additional Information
        </h2>
        {/* Add any content you want for the top-right div */}
        <p className="text-white">Additional content goes here.</p>
      </div>

      {/* Bottom Div (Transaction Table) */}
      <div className="bg-gray-800 p-6 rounded-lg border-2 col-span-2">
        <h2 className="text-xl font-bold text-white mb-4">
          Transaction History
        </h2>
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
                    <option value="">Default</option>
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
                      <td className="p-3 text-left text-white">
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
