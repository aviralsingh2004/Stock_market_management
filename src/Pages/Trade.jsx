import React, { useState ,useEffect} from "react";
import Navbar from "../Components/Navbar/Navbar";
import { typographyClasses } from "@mui/material";

const Trade = () => {
  const [search, setSearch] = useState("");
  const [companies,setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [searchterm,setSearchTerm] = useState('');
  useEffect(()=>{
    fetchCompanies();
  },[]);
  const fetchCompanies = async () => {
    try{
      const response = await fetch('http://localhost:4000/api/all_companies');
      if(!response.ok){
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCompanies(data);
    }catch (err) {
      console.error('Error fetching all company data:',err);
      setError('Failed to load company data');
      // setLoading(false);
    }
  };
  const fetchparticularcompany = async (company_name,quantity1,operation) => {
    try {
      const response = await fetch(`http://localhost:4000/api/trade`,{
        method:"POST",
        headers: {
          "Content-type":"application/json",
        },
        body: JSON.stringify({company_name,quantity1,operation}),
      });
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
    } catch (error) {
      console.error("Error:",error);
      return "There is an error while performing trade operation.";
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if(e.target.value.trim() !== ''){
      
    }
  };

  return (
    <div className = "bg-black">
      <Navbar />
      <div className="flex items-center justify-center mt-8">
        <div className="stock-container grid grid-cols-12 gap-2 items-center">
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