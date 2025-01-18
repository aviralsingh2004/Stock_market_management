import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Attempting to send login data:", formData);

    try {
      const response = await fetch("http://localhost:4000/formPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response received:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If login successful, navigate to home page
      navigate("/home");
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="bg-transparent p-8 rounded-lg border border-gray-600 shadow-md relative z-10 max-w-md w-full transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-lg hover:border-gray-500">
        <h2 className=" text-3xl pb-3 font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400">
          Login
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-white font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-4 py-3 text-white bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-white font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-4 py-3 text-white bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 my-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-900 hover:text-white"
          >
            Login
          </button>
        </form>
        <div
          className="text-center mt-4 cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/signup")}
        >
          <h2 className="text-lg">Need an account?</h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
