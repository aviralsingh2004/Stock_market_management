import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './signup.css';

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
    console.log('Attempting to send signup data:', formData);

    try {
      const response = await fetch('http://localhost:4000/signUpPost', {
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
        throw new Error(data.error || 'Signup failed');
      }

      // If signup successful, navigate to login page
      navigate('/login');
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="body-style">
        <form onSubmit={handleSubmit} className="signupform">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input 
              className="form-input" 
              type="text" 
              name="firstName" 
              id="firstName" 
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input 
              className="form-input" 
              type="text" 
              name="lastName" 
              id="lastName" 
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
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
            <label htmlFor="password" className="form-label">Password</label>
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

          <div className="form-button-container">
            <button type="submit" className="form-button">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
