import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './login.css';

export const Login = () => {
  const [formData, setFormData] = useState({
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
    console.log('Attempting to send login data:', formData);

    try {
      const response = await fetch('http://localhost:4000/formPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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
      setError(err.message);
    }
  };

  return (
    <div className="body-style">
      <div className="form-container">
        <h2 className="form-title">Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              className="form-input" 
              type="email" 
              name="email" 
              id="email" 
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password" 
              name="password" 
              id="password" 
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" id="loginButton" className="form-button">
            Login
          </button>
        </form>
      
        <div className="signup-link" onClick={() => navigate('/signup')}>
          <h2>Need an account?</h2>
        </div>
      </div>
    </div>
  );
};

export default Login;

