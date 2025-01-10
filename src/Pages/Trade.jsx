import React, { useState } from "react";
import Navbar from "../Components/Navbar/Navbar";

const Trade = () => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    console.log("Searching for stock:", search);
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center mt-8">
        <div className="grid grid-cols-12 gap-2 items-center">
          <label htmlFor="stock-search" className="sr-only">
            Search the stock
          </label>
          <input
            id="stock-search"
            type="text"
            placeholder="Search the stock"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-10 rounded-lg bg-transparent border border-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            min="0"
            step="0.01"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="col-span-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Trade;
