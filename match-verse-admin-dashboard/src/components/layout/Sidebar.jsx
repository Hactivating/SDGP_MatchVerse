import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TableCellsIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { venue, logout } = useAuth();
  const [venueInfo, setVenueInfo] = useState({
    id: null,
    location: 'Loading...',
    email: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueDetails();
  }, [venue]);

  const fetchVenueDetails = async () => {
    setLoading(true);
    try {
      // Try to get the venueId first
      let venueId = null;
      
      // Check if we have it in context
      if (venue && (venue.venueId || venue.id)) {
        venueId = venue.venueId || venue.id;
        
        // If venue object has complete info, use it directly
        if (venue.email) {
          setVenueInfo({
            id: venueId,
            location: venue.location || 'Your Venue',
            email: venue.email
          });
          setLoading(false);
          return;
        }
      }
      
      // If not in context, try localStorage
      if (!venueId) {
        const storedVenue = localStorage.getItem('venue');
        if (storedVenue) {
          try {
            // Try to parse as JSON
            const venueObj = JSON.parse(storedVenue);
            if (venueObj && (venueObj.venueId || venueObj.id)) {
              venueId = venueObj.venueId || venueObj.id;
              
              // If stored object has email, use it
              if (venueObj.email) {
                setVenueInfo({
                  id: venueId,
                  location: venueObj.location || 'Your Venue',
                  email: venueObj.email
                });
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // Not JSON, try to parse as a raw ID
            const rawId = Number(storedVenue.replace(/['"]+/g, ''));
            if (!isNaN(rawId)) {
              venueId = rawId;
            }
          }
        }
      }
      
      // If we have a venueId, get details from API
      if (venueId) {
        const token = localStorage.getItem('token');
        
        // Try getting all venues and finding the matching one
        try {
          const allVenuesResponse = await axios.get(`${API_URL}/venues`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          
          console.log('All venues response:', allVenuesResponse.data);
          
          if (Array.isArray(allVenuesResponse.data)) {
            const matchingVenue = allVenuesResponse.data.find(v => 
              (Number(v.venueId) === Number(venueId) || Number(v.id) === Number(venueId))
            );
            
            if (matchingVenue && matchingVenue.email) {
              // Store in localStorage to avoid future API calls
              localStorage.setItem('venue', JSON.stringify(matchingVenue));
              
              setVenueInfo({
                id: venueId,
                location: matchingVenue.location || 'Your Venue',
                email: matchingVenue.email
              });
              setLoading(false);
              return;
            }
          }
        } catch (allVenuesError) {
          console.warn('Unable to fetch all venues:', allVenuesError);
          
          // Try the venue profile endpoint as fallback
          try {
            const profileResponse = await axios.get(`${API_URL}/venue/profile`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });
            
            if (profileResponse.data && profileResponse.data.email) {
              // Store in localStorage to avoid future API calls
              localStorage.setItem('venue', JSON.stringify(profileResponse.data));
              
              setVenueInfo({
                id: venueId,
                location: profileResponse.data.location || 'Your Venue',
                email: profileResponse.data.email
              });
              setLoading(false);
              return;
            }
          } catch (profileError) {
            console.warn('Unable to fetch from profile endpoint:', profileError);
          }
        }
      }
      
      // If we get here, we couldn't get the email - use a placeholder
      setVenueInfo({
        id: venueId,
        location: venue?.location || 'Your Venue',
        email: venue?.email || 'No Email Available'
      });
    } catch (err) {
      console.error('Error retrieving venue details:', err);
      setVenueInfo({
        id: null,
        location: 'Your Venue',
        email: 'Error loading details'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, href: '/' },
    { name: 'Courts', icon: TableCellsIcon, href: '/courts' },
    { name: 'Bookings', icon: CalendarIcon, href: '/bookings' },
    { name: 'Venues', icon: BuildingOfficeIcon, href: '/venues' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen flex flex-col`}
    >
      {/* Header section */}
      <div className="flex-shrink-0 h-16 border-b border-gray-200 flex items-center justify-center">
        {!collapsed && (
          <h1 className="text-xl font-bold text-[rgb(73,209,84)]">Court Admin</h1>
        )}
        {collapsed && (
          <span className="text-[rgb(73,209,84)] text-xl font-bold">CA</span>
        )}
      </div>
      
      {/* Venue info section */}
      {!collapsed && (
        <div className="flex-shrink-0 px-4 py-2 mt-2 mb-2 bg-[rgba(73,209,84,0.1)] rounded-md mx-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {venueInfo.location}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {loading ? 'Loading...' : venueInfo.email}
          </p>
        </div>
      )}
      
      {/* Collapse button */}
      <div className="flex-shrink-0 flex justify-end px-2 mt-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-gray-500 hover:text-gray-800"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Navigation section - takes all available space */}
      <nav className="flex-grow overflow-y-auto pt-2">
        <ul className={`space-y-1 ${collapsed ? 'px-1' : 'px-2'}`}>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-start'} py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-[rgba(73,209,84,0.2)] text-[rgb(73,209,84)]'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${collapsed ? 'px-1' : 'px-2'}`}
                title={collapsed ? item.name : ''}
              >
                <item.icon
                  className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-6 w-6 ${
                    isActive(item.href) ? 'text-[rgb(73,209,84)]' : 'text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout section - positioned at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2">
        <button
          onClick={logout}
          className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-start'} py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 w-full ${collapsed ? 'px-1' : 'px-2'}`}
          title={collapsed ? "Logout" : ""}
        >
          <ArrowLeftOnRectangleIcon 
            className={`${collapsed ? '' : 'mr-3'} flex-shrink-0 h-6 w-6 text-gray-500`} 
            aria-hidden="true" 
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;