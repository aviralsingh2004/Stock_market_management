import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, clearAuthError, isAuthenticated, initializing } = useAuth();

  const redirectPath = useMemo(() => {
    const from = location.state?.from?.pathname || "/home";
    if (from === "/login" || from === "/") {
      return "/home";
    }
    return from;
  }, [location.state]);

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [initializing, isAuthenticated, navigate, redirectPath]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    clearAuthError();

    try {
      await login(formData);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err?.message || "An error occurred. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initializing && !isAuthenticated) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center text-white">
        Checking session...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="bg-transparent p-8 rounded-lg border border-gray-600 shadow-md relative z-10 max-w-md w-full transition duration-300 ease-in-out transform hover:scale-102 hover:shadow-lg hover:border-gray-500">
        <h2 className=" text-3xl pb-3 font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400">
          Login
        </h2>
        {(error) && (
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
            className="w-full py-3 my-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
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
