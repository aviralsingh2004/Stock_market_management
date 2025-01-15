import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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

    try {
      const response = await fetch("http://localhost:4000/signUpPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      navigate("/login");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="bg-transparent p-8 rounded-lg border border-gray-600 shadow-md relative z-10 max-w-md w-full transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-lg hover:border-gray-500">
        <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400">
          Sign up
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
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              className="w-full px-4 py-3 text-white bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-white font-medium mb-2"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              className="w-full px-4 py-3 text-white bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

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
            Register
          </button>
        </form>
        <div
          className="text-center mt-4 cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/login")}
        >
          <h2 className="text-lg">Already have an account?</h2>
        </div>
      </div>
    </div>
  );
};

export default Signup;
