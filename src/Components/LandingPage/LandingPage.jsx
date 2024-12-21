import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Landingpage.css';
import Login from '../Login/Login';
import Signup from '../Signup/signup';
export const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="landing-container">
      <ul className="nav-buttons">
        <li>
          <button onClick={handleLoginClick} className="nav-button">
            Login
          </button>
        </li>
        <li>
          <button onClick={handleSignupClick} className="nav-button">
            SignUp
          </button>
        </li>
        </ul>
    </div>
  )
}

export default LandingPage;
