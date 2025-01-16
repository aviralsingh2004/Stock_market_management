import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { Chart as ChartJS } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const Portfolio = () => {
  const [stockinfo, setStockInfo] = useState([]);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [tinfo, settinfo] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchStockInfo();
    fetchTransactionInfo(); // Fetch transaction data on component mount
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/user/balance", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to fetch balance");
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.log("Failed to fetch balance");
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
      const response = await fetch(
        "http://localhost:4000/api/get_transaction/"
      );
      if (!response.ok) throw new Error("Failed to get transaction record");
      const data = await response.json();
      console.log("Transaction data:", data); // Debug log
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

  return (
    <div>
      <Navbar />
      <div className="text-center text-white mt-[68px] mb-4">
        <p className="text-lg">Current Balance: ${balance}</p>
      </div>
    </div>
  );
};

export default Portfolio;
