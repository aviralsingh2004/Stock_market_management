import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { typographyClasses } from "@mui/material";

const Trade = () => {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [operation, setOperation] = useState("Buy_stock");
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [stockinfo, setStockInfo] = useState([]);
  const [success, setSuccess] = useState("");
  const [err, seterr] = useState("");
  const [loading, setLoading] = useState("Loading...");
  const [isVisible, setIsVisible] = useState(false);
  // const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchCompanies();
    fetchNews();
    fetchStockInfo();
  }, []);

  // Filter companies based on search input
  const filteredCompanies = companies.filter((company) =>
    company.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const fetchCompanies = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/all_companies");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setLoading(null);
      setCompanies(data);
    } catch (err) {
      console.error("Error fetching all company data:", err);
      setError("Failed to load company data");
    }
  };

  const fetchStockInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_stock");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setStockInfo(data);
    } catch (err) {
      console.error("Error fetching all company data:", err);
      setError("Failed to load company data");
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/current_news");
      if (!response.ok) throw new Error("Failed to fetch news");
      
      const data = await response.json();
      
      // Wait until data is non-empty
      if (data && data.length > 0) {
        setNews(data);
      } else {
        console.log("Waiting for news data...");
        setTimeout(fetchNews, 3000); // Retry after 3 seconds
      }
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };
  

  const fetchparticularcompany = async (company_name, quantity1, operation) => {
    try {
      const response = await fetch(`http://localhost:4000/api/trade`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ company_name, quantity1, operation }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("There is an error while performing trade operation.");
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSearch(company.name);
    // setFilteredCompanies([]);
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !quantity) {
      setError("Please select a company and enter quantity");
      return;
    }
    try {
      console.log(selectedCompany);
      await fetchparticularcompany(selectedCompany, quantity, operation);
      console.log("reached here");
      setError(null);
      setTimeout(() => {
        setIsVisible(false); // Start fading
      }, 2000); // Message stays for 3 seconds

      setTimeout(() => {
        setSuccess(null);
      }, 4000);
      // Reset form
      setQuantity("");
      setSelectedCompany(null);
      setSearch("");
      setSuccess("Stock bought  Successfully!");
      operation === "Buy_stock"
        ? setSuccess("Stock bought  Successfully!")
        : setSuccess("Stock sold  Successfully!");
      fetchStockInfo();
    } catch (err) {
      operation === "Buy_stock"
        ? setError("Insufficient Balance")
        : setError("You do not own it!");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 text-white">
      <Navbar />
      <div className="justify-center item-center max-h-screen mt-6 mx-auto pt-[68px] px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 bg-gray-900 rounded-2xl p-6 h-[600px] overflow-y-auto shadow-lg ">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              Market News
            </h2>
            <div className="space-y-4">
              {loading === null ? (
                <ul className="space-y-3">
                  {news.map((article, index) => (
                    <li
                      key={index}
                      className="group bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors duration-200"
                    >
                      <a
                        href={article.hyperlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 group-hover:text-blue-300 font-medium transition-colors duration-200"
                      >
                        {article.headline}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-400">{loading}</div>
              )}
            </div>
          </div>

          {/* Middle Section - Trade Form */}
          <div className="lg:col-span-5 bg-gray-900 rounded-lg p-6">
            <form onSubmit={handleTradeSubmit} className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a company"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Search Suggestions */}
              </div>
              <div className="text-center">{selectedCompany}</div>
              {/* Trade Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => {
                      console.log("Selected value:", e.target.value); // Debugging
                      setOperation(e.target.value);
                    }}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2"
                  >
                    <option value="Buy_stock">Buy</option>
                    <option value="Sell_stock">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Simple Error Display */}
              {error && (
                <div className="bg-red-900/50 text-red-300 p-4 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div
                  className={`bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded ${
                    isVisible ? "fade-in" : "fade-out"
                  }`}
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition duration-200"
              >
                Execute Trade
              </button>
            </form>
            <div className="bg-gray-900 max-h-[298px] overflow-y-auto rounded-2xl shadow-md relative z-10 w-full mt-4">
              <table className="bg-transparent rounded-2xl text-white w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 text-left text-white">Company Name</th>
                    <th className="p-3 text-center text-white">Stocks Owned</th>
                    <th className="p-3 text-right text-white">Money Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {stockinfo
                    .filter((stock) => stock.quantity !== 0)
                    .map((stock, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-800 transition-colors"
                      >
                        <td className="p-3 text-left text-white">
                          {stock.company_name}
                        </td>
                        <td className="p-3 text-white text-center">
                          {stock.quantity}
                        </td>
                        <td className="p-3 text-white text-center">
                          {(stock.quantity * stock.average_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar - Stock Details */}
          <div className="lg:col-span-4 bg-gray-900 max-h-[600px] overflow-y-auto rounded-2xl shadow-md relative z-10 w-full">
            {/* <h2 className="text-xl font-bold mb-4">Stock Details</h2> */}
            <table className="bg-transparent rounded-2xl text-white w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-700" class="relative">
                  <th className="p-3 text-left text-white">Company Name</th>
                  <th className="p-3 text-left text-white">Stock Price</th>
                  <th className="p-3 text-right text-white">Stock Left</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedCompany(company.company_name)}
                  >
                    <td className="p-3 text-white text-left">
                      {company.company_name}
                    </td>
                    <td className="p-3 text-white text-left">
                      {company.stock_price}
                    </td>
                    <td className="p-3 text-white text-right">
                      {company.total_shares}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
