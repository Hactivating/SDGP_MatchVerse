import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  TableCellsIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { venue, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [venueInfo, setVenueInfo] = useState({
    location: 'Your Venue',
    email: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [venueId, setVenueId] = useState(null);

  useEffect(() => {
    const storedVenueId = localStorage.getItem('venue');
    if (storedVenueId) {
      const parsedVenueId = Number(storedVenueId.replace(/['"]+/g, ''));
      setVenueId(parsedVenueId);
      fetchVenueDetails(parsedVenueId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchVenueDetails = async (id) => {
    try {
      const fullUrl = `${API_URL}/venues`;
      const response = await axios.get(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      const venues = response.data || [];
      const matchedVenue = venues.find(venue => 
        Number(venue.venueId) === Number(id)
      );
      
      if (!matchedVenue) {
        return;
      }

      setVenueInfo({
        location: matchedVenue.location || 'Your Venue',
        email: matchedVenue.email || 'No Email Available'
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Courts', href: '/courts', icon: TableCellsIcon },
    { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
    { name: 'Venue Profile', href: '/profile', icon: BuildingOfficeIcon },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col h-full border-r border-gray-200 bg-white pt-5">
          <div className="flex items-center flex-shrink-0 px-4 mb-4">
            <span className="text-xl font-bold text-gray-800">Court Management</span>
          </div>
          
          <div className="px-4 py-2 mt-2 mb-4 bg-[rgba(73,209,84,0.1)] rounded-md">
            <p className="text-sm font-medium text-gray-900 truncate">
              {venueInfo.location}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {loading ? 'Loading...' : venueInfo.email}
            </p>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      active
                        ? 'bg-[rgb(73,209,84)] text-white'
                        : 'text-gray-600 hover:bg-[rgba(73,209,84,0.1)] hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200 mt-auto">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 flex-shrink-0 h-6 w-6 text-red-400"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transition ease-in-out duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden flex flex-col h-full`}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-800">Court Manager</span>
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(73,209,84)]"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-shrink-0 px-4 py-2 mt-2 mb-4 bg-[rgba(73,209,84,0.1)] rounded-md mx-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {venueInfo.location}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {loading ? 'Loading...' : venueInfo.email}
          </p>
        </div>

        <div className="flex-grow overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    active
                      ? 'bg-[rgb(73,209,84)] text-white'
                      : 'text-gray-600 hover:bg-[rgba(73,209,84,0.1)] hover:text-gray-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 w-full"
          >
            <ArrowLeftOnRectangleIcon
              className="mr-3 flex-shrink-0 h-6 w-6 text-red-400"
              aria-hidden="true"
            />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 md:pl-64">
        <div className="sticky top-0 z-10 md:hidden bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              type="button"
              className="px-2 py-1 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(73,209,84)]"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <span className="text-lg font-medium text-gray-900">Court Management</span>
            <div className="flex items-center">
              <div className="flex flex-col items-end mr-2 sm:block">
                <span className="text-xs font-medium"> {venueInfo.location} </span>
                <span className="text-xs text-gray-500">{loading ? 'Loading...' : venueInfo.email}</span>
              </div>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;