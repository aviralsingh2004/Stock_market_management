import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { SparklesCore } from "../ui/sparkles";
export const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:4000/signUpPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // If signup successful, navigate to home page
      navigate('/login');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  return (
    <div>
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
            <h2 className = "text-2xl font-bold text-center mb-4 text-white">Sign up</h2>
          {error && <div className="">{error}</div>}
        <form onSubmit={handleSubmit} className="signupform">
          
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-white font-bold mb-1">First Name</label>
            <input 
              className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white" 
              type="text" 
              name="firstName" 
              id="firstName" 
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-white font-bold mb-1">Last Name</label>
            <input 
              className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white" 
              type="text" 
              name="lastName" 
              id="lastName" 
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-white font-bold mb-1">Email</label>
            <input 
              className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white" 
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
            <label htmlFor="password" className="block text-white font-bold mb-1">Password</label>
            <input
              className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white"
              type="password" 
              name="password" 
              id="password" 
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <button type="submit" className="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200">Register</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Signup;
