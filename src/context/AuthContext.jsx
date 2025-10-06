import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Resolve API base for LAN access without hardcoding localhost
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "") ||
  `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_API_PORT || 4000}`;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/check`, {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        setAuthError(null);
        return;
      }

      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setAuthError(null);
    } catch (error) {
      console.error("Failed to verify authentication:", error);
      setUser(null);
      setAuthError("Unable to verify authentication status. Please try again.");
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async ({ email, password }) => {
    try {
      setAuthError(null);
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || "Login failed";
        setAuthError(message);
        throw new Error(message);
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      if (!(error instanceof Error)) {
        setAuthError("Login failed");
        throw new Error("Login failed");
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    logout,
    refreshAuth,
    authError,
    clearAuthError,
  }), [authError, clearAuthError, initializing, login, logout, refreshAuth, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

