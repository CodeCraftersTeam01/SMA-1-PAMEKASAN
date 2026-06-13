import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const can = (resource, action) => {
    // Basic implementation: if user is admin, allow all. 
    // Extend this logic later if you have granular permissions.
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'Admin') return true;
    return false;
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
