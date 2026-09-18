import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        const { user: userData, token: jwtToken } = res.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Failed to login with provided credentials',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        const { user: newUser, token: jwtToken } = res.data;
        setUser(newUser);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Quick Demo Login Helper
  const quickLogin = async (role = 'student') => {
    const credentials = {
      admin: { email: 'chiefwarden@nitc.ac.in', password: 'Admin@123' },
      staff: { email: 'caretaker.mh@nitc.ac.in', password: 'Staff@123' },
      student: { email: 'keerthan_b241139ch@nitc.ac.in', password: 'Student@123' },
    };

    const target = credentials[role] || credentials.student;
    return await login(target.email, target.password);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated,
        isAdmin,
        isStaff,
        isStudent,
      }}
    >
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
