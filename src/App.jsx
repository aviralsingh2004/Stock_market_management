import React, { useState } from "react";
import StockChart from "./StockChart";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (credentials) => {
    // Implement your login logic here
    // For demo purposes, we'll just set authenticated to true
    setIsAuthenticated(true);
  };

  const handleRegister = (userData) => {
    // Implement your registration logic here
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px" }}>
        {!showRegister ? (
          <>
            <Login onLogin={handleLogin} />
            <p>
              Don't have an account?{" "}
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </>
        ) : (
          <>
            <Register onRegister={handleRegister} />
            <p>
              Already have an account?{" "}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Stock Price Visualizer</h1>
      <button 
        onClick={() => setIsAuthenticated(false)}
        style={{ position: 'absolute', top: '20px', right: '20px' }}
      >
        Logout
      </button>
      <label>
        Enter Stock Symbol:{" "}
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="e.g., AAPL"
        />
      </label>
      <StockChart symbol={symbol} />
    </div>
  );
}

export default App;
