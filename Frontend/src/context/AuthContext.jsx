import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Verifying on load

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!storedToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  // On app mount, verify token against the backend
  useEffect(() => {
    const verifyAuth = async () => {
      // Intercept token from URL query string if present
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch fresh user data from server — NOT from stored JSON
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);   // Role comes from the SERVER, not storage
          setToken(storedToken);
        } else {
          // Token is invalid or expired — force logout
          clearStorage();
        }
      } catch {
        // Network error, clear state
        clearStorage();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const login = (userData, tokenValue, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', tokenValue);
    // Note: We only store token. User data is always fetched from server.
    setUser(userData);
    setToken(tokenValue);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch {
        // Ignore errors on logout
      }
    }
    clearStorage();
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
