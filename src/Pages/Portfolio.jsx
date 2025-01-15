import React, { useState, useEffect } from "react";
//import { SparklesCore } from "D:/Web Development/DBMS/stock-visualizer/dbms-project/src/Components/ui/sparkles.jsx";
import Navbar from "../Components/Navbar/Navbar";
import { SparklesCore } from "../Components/ui/sparkles";
const Trade = () => {
  const [add, setAdd] = useState("");
  const [withdraw, setWithdraw] = useState("");
  const [err, seterr] = useState("");
  const [balance, setBalance] = useState(0);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBalance();
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

  return (
    <div>
      <Navbar />
      <div className="text-center text-white mb-4">
        <p className="text-lg">Current Balance: ${balance}</p>
      </div>
    </div>
  );
};
export default Trade;
