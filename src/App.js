import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Components/LandingPage/LandingPage";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/signup";
import Home from "./Pages/Home";
import Funds from "./Pages/Funds";
import Porfolio from "./Pages/Portfolio";
import Trade from "./Pages/Trade";
import Chatbot from "./Pages/chatbot.jsx";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/home"
              element={(
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/funds"
              element={(
                <ProtectedRoute>
                  <Funds />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/portfolio"
              element={(
                <ProtectedRoute>
                  <Porfolio />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/trade"
              element={(
                <ProtectedRoute>
                  <Trade />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/chatbot"
              element={(
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              )}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
