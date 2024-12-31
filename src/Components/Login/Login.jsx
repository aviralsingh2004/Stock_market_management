import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesCore } from '../ui/sparkles'; // Make sure this component is defined and loaded.

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Attempting to send login data:', formData);

    try {
      const response = await fetch('http://localhost:4000/formPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response received:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // If login successful, navigate to home page
      navigate('/home');
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full pointer-events-none"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="bg-transparent p-6 rounded-lg shadow-md relative z-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2 text-white border bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 text-white border bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
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
            className="w-full bg-transparent text-white py-2 my-4 rounded-lg hover:bg-white hover:text-black transition duration-200"
          >
            Login
          </button>
        </form>
        <div
          className="text-center mt-4 cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => navigate('/signup')}
        >
          <h2>Need an account?</h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
