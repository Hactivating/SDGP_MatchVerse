import React, { useEffect, useState } from 'react';
import { 
  PresentationChartLineIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  TableCellsIcon,
  PlusCircleIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Stats from '../components/ui/Stats';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Dashboard = () => {
  const { venue } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalCourts: 0,
    location: '',
    openingTime: 0,
    closingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const [error, setError] = useState(null);
  const [parsedVenueId, setParsedVenueId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedVenueId = localStorage.getItem('venue');
      let parsedVenueId = null;
      
      if (storedVenueId) {
        parsedVenueId = Number(storedVenueId.replace(/['"]+/g, ''));
        setParsedVenueId(parsedVenueId);
      }
      
      if (!parsedVenueId || isNaN(parsedVenueId)) {
        try {
          const venueObj = JSON.parse(storedVenueId);
          if (venueObj && venueObj.venueId) {
            parsedVenueId = Number(venueObj.venueId);
          } else if (venueObj && venueObj.id) {
            parsedVenueId = Number(venueObj.id);
          }
          setParsedVenueId(parsedVenueId);
        } catch (e) {}
      }
      
      if ((!parsedVenueId || isNaN(parsedVenueId)) && venue) {
        if (venue.venueId) {
          parsedVenueId = Number(venue.venueId);
        } else if (venue.id) {
          parsedVenueId = Number(venue.id);
        }
        setParsedVenueId(parsedVenueId);
      }
      
      if (!parsedVenueId || isNaN(parsedVenueId)) {
        setError('No venue information found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const courtsUrl = `${API_URL}/courts?venueId=${parsedVenueId}`;
      const courtsResponse = await axios.get(courtsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const allCourts = courtsResponse.data || [];
      const courts = allCourts.filter(court => 
        Number(court.venueId) === Number(parsedVenueId)
      );
      
      const hasCourts = courts.length > 0;
      setIsEmpty(!hasCourts);
      
      if (hasCourts) {
        try {
          let allBookings = [];
          try {
            const bookingsUrl = `${API_URL}/venue/${parsedVenueId}/bookings`;
            const bookingsResponse = await axios.get(bookingsUrl, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            allBookings = bookingsResponse.data || [];
          } catch (bookingsErr) {
            const altBookingsUrl = `${API_URL}/bookings`;
            const altResponse = await axios.get(altBookingsUrl, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            const courtIds = courts.map(court => Number(court.id || court.courtId));
            allBookings = (altResponse.data || []).filter(booking => 
              courtIds.includes(Number(booking.courtId))
            );
          }
          
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          const formattedDate = `${yyyy}-${mm}-${dd}`;
          
          let todayBookings = [];
          try {
            const todayBookingsUrl = `${API_URL}/venue/${parsedVenueId}/bookings/today`;
            const todayResponse = await axios.get(todayBookingsUrl, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            todayBookings = todayResponse.data || [];
          } catch (err) {
            todayBookings = allBookings.filter(booking => booking.date === formattedDate);
          }
          
          let venueDetails = venue || {};
          if (!venueDetails.location || !venueDetails.openingTime) {
            try {
              const venueUrl = `${API_URL}/venues/${parsedVenueId}`;
              const venueResponse = await axios.get(venueUrl, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (venueResponse.data) {
                venueDetails = {
                  ...venueDetails,
                  ...venueResponse.data
                };
              }
            } catch (venueErr) {}
          }
          
          setStats({
            totalBookings: allBookings.length,
            todayBookings: todayBookings.length,
            totalCourts: courts.length,
            location: venueDetails?.location || 'Your Venue',
            openingTime: venueDetails?.openingTime || 900,
            closingTime: venueDetails?.closingTime || 1800
          });
          
          generateWeeklyBookingData(allBookings);
          generateRecentActivity(allBookings, courts);
        } catch (err) {
          setStats({
            totalBookings: 0,
            todayBookings: 0, 
            totalCourts: courts.length,
            location: venue?.location || 'Your Venue',
            openingTime: venue?.openingTime || 900,
            closingTime: venue?.closingTime || 1800
          });
          
          // Initialize empty weekly data
          initializeEmptyWeeklyData();
        }
      } else {
        // Initialize empty weekly data
        initializeEmptyWeeklyData();
        setStats({
          totalBookings: 0,
          todayBookings: 0,
          totalCourts: 0,
          location: venue?.location || 'Your Venue',
          openingTime: venue?.openingTime || 900,
          closingTime: venue?.closingTime || 1800
        });
      }
    } catch (error) {
      setError('Failed to load dashboard data. Please try again later.');
      initializeEmptyWeeklyData();
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyBookingData = (allBookings) => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = daysOfWeek.map(day => ({
      date: day,
      bookings: 0
    }));
    
    try {
      if (allBookings && allBookings.length > 0) {
        allBookings.forEach(booking => {
          if (booking.date) {
            const bookingDate = new Date(booking.date);
            if (!isNaN(bookingDate.getTime())) {
              let dayOfWeek = bookingDate.getDay();
              dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              if (weeklyData[dayOfWeek]) {
                weeklyData[dayOfWeek].bookings += 1;
              }
            }
          }
        });
      }
      
      setBookingData(weeklyData);
    } catch (err) {
      initializeEmptyWeeklyData();
    }
  };

  const initializeEmptyWeeklyData = () => {
    setBookingData([
      { date: 'Mon', bookings: 0 },
      { date: 'Tue', bookings: 0 },
      { date: 'Wed', bookings: 0 },
      { date: 'Thu', bookings: 0 },
      { date: 'Fri', bookings: 0 },
      { date: 'Sat', bookings: 0 },
      { date: 'Sun', bookings: 0 },
    ]);
  };

  const generateRecentActivity = (bookings, courts) => {
    try {
      const activities = [];
      
      if (bookings && bookings.length > 0) {
        const sortedBookings = [...bookings].sort((a, b) => {
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        });
        
        const recentBookings = sortedBookings.slice(0, 3);
        recentBookings.forEach(booking => {
          activities.push({
            type: 'booking',
            description: `New booking for court ${booking.courtId || 'Unknown'} on ${new Date(booking.date).toLocaleDateString()}`,
            timestamp: formatTimestamp(booking.createdAt || booking.date)
          });
        });
      }
      
      if (courts && courts.length > 0) {
        const mostRecentCourt = courts[courts.length - 1];
        activities.push({
          type: 'court',
          description: `Court "${mostRecentCourt.name}" is available for bookings`,
          timestamp: formatTimestamp(mostRecentCourt.createdAt || new Date())
        });
      }
      
      if (venue) {
        activities.push({
          type: 'venue',
          description: 'Venue profile information updated',
          timestamp: formatTimestamp(venue.updatedAt || new Date())
        });
      }
      
      const sortedActivities = activities.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setRecentActivity(sortedActivities.length > 0 ? sortedActivities : []);
    } catch (err) {
      setRecentActivity([]);
    }
  };

  const formatTimestamp = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return 'Recently';
    }
  };

  const formatTimeDisplay = (time) => {
    if (time === undefined || time === null) return 'N/A';
    
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    
    let period = 'AM';
    let displayHours = hours;
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) {
        displayHours = hours - 12;
      }
    }
    if (displayHours === 0) {
      displayHours = 12;
    }
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={() => fetchData()}>Retry</Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Your Venue Dashboard</h1>
        
        <Card>
          <div className="py-8 text-center">
            <div className="mx-auto h-24 w-24 text-[rgb(73,209,84)] mb-4">
              <PlusCircleIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started with Your Venue</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Your venue doesn't have any courts yet. Add courts to start managing bookings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-[rgba(73,209,84,0.1)] flex items-center justify-center text-[rgb(73,209,84)] mr-2">
                    1
                  </div>
                  <h3 className="font-semibold">Create Courts</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Start by adding courts to your venue
                </p>
                <Link 
                  to="/courts" 
                  className="inline-flex items-center px-3 py-2 text-sm bg-[rgb(73,209,84)] text-white rounded-md"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  Add Your First Court
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-[rgba(73,209,84,0.1)] flex items-center justify-center text-[rgb(73,209,84)] mr-2">
                    2
                  </div>
                  <h3 className="font-semibold">Update Your Profile</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Complete your venue profile information
                </p>
                <Link 
                  to="/profile" 
                  className="inline-flex items-center px-3 py-2 text-sm bg-[rgb(73,209,84)] text-white rounded-md"
                >
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Venue Dashboard</h1>
      
      {/* Venue Information */}
      <Card title="Venue Information">
        <div className="space-y-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 text-[rgb(73,209,84)] mr-2" />
            <span className="text-lg font-medium">Venue ID: {parsedVenueId || venue?.venueId || 'N/A'}</span>
          </div>          
          <div className="pt-2">
            <Link 
              to="/profile" 
              className="text-[rgb(73,209,84)] hover:underline inline-flex items-center"
            >
              Edit Venue Profile
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </Card>
      
      {/* Stats Cards
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stats 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon={PresentationChartLineIcon} 
          change={0} 
          changeType="neutral" 
        />
        <Stats 
          title="Today's Bookings" 
          value={stats.todayBookings} 
          icon={UserGroupIcon} 
        />
        <Stats 
          title="Total Courts" 
          value={stats.totalCourts} 
          icon={TableCellsIcon} 
        />
      </div> */}
      
      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Booking Overview">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="rgb(73, 209, 84)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/bookings" 
              className="p-4 bg-[rgba(73,209,84,0.1)] rounded-lg flex flex-col items-center justify-center hover:bg-[rgb(73,209,84)] hover:text-white transition-colors"
            >
              <PresentationChartLineIcon className="h-10 w-10 mb-2 text-[rgb(73,209,84)] group-hover:text-white" />
              <span className="font-medium">Manage Bookings</span>
            </Link>
            
            <Link 
              to="/courts" 
              className="p-4 bg-[rgba(73,209,84,0.1)] rounded-lg flex flex-col items-center justify-center hover:bg-[rgb(73,209,84)] hover:text-white transition-colors"
            >
              <TableCellsIcon className="h-10 w-10 mb-2 text-[rgb(73,209,84)] group-hover:text-white" />
              <span className="font-medium">Manage Courts</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="p-4 bg-[rgba(73,209,84,0.1)] rounded-lg flex flex-col items-center justify-center hover:bg-[rgb(73,209,84)] hover:text-white transition-colors"
            >
              <BuildingOfficeIcon className="h-10 w-10 mb-2 text-[rgb(73,209,84)] group-hover:text-white" />
              <span className="font-medium">Venue Profile</span>
            </Link>
            
            <div className="p-4 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <UserGroupIcon className="h-10 w-10 mb-2 text-gray-400" />
              <span className="font-medium text-gray-500">User Stats</span>
              <span className="text-xs text-gray-400 mt-1">Coming Soon</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
                  activity.type === 'booking' ? 'bg-green-100' : 
                  activity.type === 'court' ? 'bg-blue-100' : 'bg-yellow-100'
                } flex items-center justify-center`}>
                  {activity.type === 'booking' ? (
                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                  ) : activity.type === 'court' ? (
                    <TableCellsIcon className="h-6 w-6 text-blue-600" />
                  ) : (
                    <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">No recent activity to display</p>
                <p className="text-xs text-gray-500">Activities will appear here as you use the system</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;