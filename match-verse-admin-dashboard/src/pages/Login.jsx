import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('Signing in...');
    
    try {
      await login(email, password);
      
      setStatusMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setStatusMessage('');
      setError(err.response?.data?.message || 'Invalid venue credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Court Venue Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your venue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Venue Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          
          {statusMessage && !error && (
            <div className="text-green-600 text-sm text-center">{statusMessage}</div>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex justify-center items-center">
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <div className="bg-primary text-white py-2 px-4 rounded-lg inline-block">
            Venue Owner Portal for Indoor Courts
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;