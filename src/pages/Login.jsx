import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Check Admin credentials
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('token', 'mock_admin_token');
          localStorage.setItem('username', 'Admin');
          localStorage.setItem('role', 'admin');
          setSuccess('Admin Login successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Mock Login
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          localStorage.setItem('token', 'mock_jwt_token_12345');
          localStorage.setItem('username', username);
          localStorage.setItem('role', 'user');
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setError('Invalid credentials');
        }
      } else {
        // Mock Registration
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        if (users.find(u => u.username === username)) {
          setError('Username already exists');
        } else {
          users.push({ username, password });
          localStorage.setItem('mockUsers', JSON.stringify(users));
          setSuccess('Registration successful! Please login.');
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
          }, 1500);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 transform transition-all duration-300">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 font-medium">
              Smart Complaint Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white sm:text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 bg-gray-50 focus:bg-white sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Sign Up'} <LogIn className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="font-bold text-purple-600 hover:text-purple-500 hover:underline inline-flex transition-colors duration-200"
              >
                {isLogin ? 'Create one now' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
