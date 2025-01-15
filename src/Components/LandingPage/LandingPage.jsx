import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landingpage.css"; // Assuming custom styles for more control

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black h-screen flex flex-col items-center justify-center">
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 transition duration-300 ease-in-out transform hover:text-gray-200">
        Welcome to your Stock Management Application
      </h1>
      <div className="flex space-x-8">
        <button
          onClick={handleLoginClick}
          className="relative px-8 py-4 text-gray-200 font-semibold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 overflow-hidden group"
        >
          Login
          <span className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-20 z-0 transform scale-x-0 transition-transform duration-300 ease-in-out origin-right group-hover:scale-x-100"></span>
        </button>
        <button
          onClick={handleSignupClick}
          className="relative px-8 py-4 text-gray-200 font-semibold rounded-lg shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 overflow-hidden group"
        >
          Sign Up
          <span className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-20 z-0 transform scale-x-0 transition-transform duration-300 ease-in-out origin-right group-hover:scale-x-100"></span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
