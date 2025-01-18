import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";

export const Funds = () => {
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

  const handleAdd = async (e) => {
    e.preventDefault();
    seterr("");
    setSuccess("");
    if (!add || isNaN(add) || Number(add) <= 0) {
      seterr("Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/user/total_balance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ val: Number(add), operation: "add" }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      setBalance(data.balance);
      setSuccess("Funds added Successfully!");
      setAdd("");
    } catch (err) {
      seterr(err.message || "Failed to add funds");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    seterr("");
    setSuccess("");
    if (!withdraw || isNaN(withdraw) || Number(withdraw) <= 0) {
      seterr("Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/user/total_balance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            val: Number(withdraw),
            operation: "withdraw",
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Insufficient Balance`);
      }
      setBalance(data.balance);
      setSuccess("Funds withdrawn Successfully!");
      setWithdraw("");
    } catch (err) {
      seterr(err.message || "Failed to withdraw funds");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex bg-gradient-to-r from-blue-900 to-blue-950 items-center justify-center min-h-screen">
        <div className="w-full  mx-auto p-6  bg-gray-900   shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Wallet
          </h2>

          {/* Display balance */}
          <div className="  text-center text-white mb-4">
            <p className="text-lg">Current Balance: ${balance}</p>
          </div>

          {/* Error and success messages */}
          {err && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {err}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              {success}
            </div>
          )}

          {/* Add Funds Form */}
          <form className="space-y-4" onSubmit={handleAdd}>
            <div className="space-y-2 ">
              <label
                htmlFor="add"
                className="block text-sm font-medium text-white"
              >
                Add funds
              </label>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="number"
                  id="add"
                  name="add"
                  placeholder="Enter amount to add"
                  value={add}
                  onChange={(e) => setAdd(e.target.value)}
                  className="col-span-10 rounded-lg bg-transparent border border-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  min="0"
                  step="0.01"
                />
                <button
                  type="submit"
                  className="col-span-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Withdraw Funds Form */}
          <form className="space-y-4" onSubmit={handleWithdraw}>
            <div className="space-y-2">
              <label
                htmlFor="withdraw"
                className="block text-sm font-medium text-white"
              >
                Withdraw funds
              </label>
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="number"
                  id="withdraw"
                  name="withdraw"
                  placeholder="Enter amount to withdraw"
                  value={withdraw}
                  onChange={(e) => setWithdraw(e.target.value)}
                  className="col-span-10 rounded-lg bg-transparent border border-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  min="0"
                  step="0.01"
                />
                <button
                  type="submit"
                  className="col-span-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Funds;
