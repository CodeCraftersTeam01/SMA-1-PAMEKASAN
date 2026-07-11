import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const _isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (_isLocalhost ? 'http://localhost:8000' : 'https://api.smansa.m-tech.fun');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          clearStorage();
        }
      } catch {
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

  const can = (resource, action = 'view') => {
    if (!user) return false;
    // Admins always have full access
    if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'Admin') return true;
    // Non-admins are gated by their granted permissions map
    const perms = user.permissions;
    if (!perms || typeof perms !== 'object') return false;
    const resourcePerms = perms[resource];
    if (!resourcePerms) return false;
    return resourcePerms[action] === true;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole, can, refreshUser }}>
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
