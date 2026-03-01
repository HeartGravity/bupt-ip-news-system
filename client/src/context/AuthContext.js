import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 设置全局请求头中的 token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/auth/me');

        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('认证失败，请重新登录');
        }
      } catch (err) {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(err.response?.data?.message || '加载用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // 注册用户
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/auth/register', userData);

      if (res.data.success) {
        setToken(res.data.token);
        return true;
      } else {
        setError(res.data.message || '注册失败');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || '注册失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登录用户
  const login = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/auth/login', userData);

      if (res.data.success) {
        setToken(res.data.token);
        return true;
      } else {
        setError(res.data.message || '登录失败');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || '登录失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出用户
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // 更新用户资料
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.put('/auth/profile', userData);

      if (res.data.success) {
        setUser(res.data.data);
        return { success: true };
      } else {
        setError(res.data.message || '更新资料失败');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || '更新资料失败';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 更新密码
  const updatePassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.put('/auth/password', passwordData);
      
      if (res.data.success) {
        return { success: true };
      } else {
        setError(res.data.message || '更新密码失败');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || '更新密码失败';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 清除错误信息
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};