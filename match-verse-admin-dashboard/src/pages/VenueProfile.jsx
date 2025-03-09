import React, { useState, useEffect, useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const VenueProfile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [venueId, setVenueId] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    location: '',
    openingTime: 900,
    closingTime: 1800,
    photoUrl: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    const storedVenueId = localStorage.getItem('venue');
    if (storedVenueId) {
      const parsedVenueId = Number(storedVenueId.replace(/['"]+/g, ''));
      setVenueId(parsedVenueId);
      fetchVenueDetails(parsedVenueId);
    } else {
      setError('No venue information found');
      setLoading(false);
    }
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const fetchVenueDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/venues`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      const venues = response.data || [];
      const matchedVenue = venues.find(venue =>
        Number(venue.venueId) === Number(id)
      );
      
      if (!matchedVenue) {
        setError('No matching venue found');
        return;
      }
      
      setFormData({
        email: matchedVenue.email || '',
        location: matchedVenue.location || '',
        openingTime: matchedVenue.openingTime || 900,
        closingTime: matchedVenue.closingTime || 1800,
        photoUrl: matchedVenue.photoUrl || ''
      });
    } catch (err) {
      if (err.response) {
        setError(`Failed to fetch venues: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError('An error occurred while fetching venue details.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const [hours, minutes] = value.split(':');
    const timeValue = parseInt(hours) * 100 + parseInt(minutes);
    setFormData({
      ...formData,
      [name]: timeValue
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const formatTimeForInput = (time) => {
    const hours = Math.floor(time / 100).toString().padStart(2, '0');
    const minutes = (time % 100).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG or PNG)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    // Store selected file
    setSelectedFile(file);
    
    // Clear previous preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Create a local preview
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    
    setSuccess('Photo selected. Click "Save Changes" to update your profile.');
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Base64 encode the image for direct embedding in JSON
  const encodeFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  const updateProfile = async (e) => {
    e.preventDefault();
    
    if (!venueId) {
      setError('Cannot update profile: Venue ID is missing');
      return;
    }
    
    setUpdating(true);
    setSuccess('');
    setError('');
    
    try {
      // Create a copy of form data to send to the server
      const updatedData = { ...formData };
      
      // If we have a selected file, encode it as base64 and include it in the request
      if (selectedFile) {
        try {
          setUploading(true);
          // Convert file to base64
          const base64Image = await encodeFileToBase64(selectedFile);
          
          // Add it to the update data
          updatedData.photoBase64 = base64Image;
          updatedData.photoFilename = selectedFile.name;
          updatedData.photoMimeType = selectedFile.type;
        } catch (fileError) {
          console.error('Error encoding file:', fileError);
          setError('Failed to process image. Please try again.');
          setUpdating(false);
          setUploading(false);
          return;
        }
      }
      
      // Update profile with all data including the encoded image if present
      const response = await axios.put(`${API_URL}/venues/${venueId}`, updatedData);
      
      if (response.data) {
        // If the server returns a photoUrl in the response, update it
        if (response.data.photoUrl) {
          updatedData.photoUrl = response.data.photoUrl;
        }
        
        // Update localStorage with all the updated venue data
        const updatedVenue = { 
          ...JSON.parse(localStorage.getItem('venue') || '{}'), 
          ...response.data 
        };
        localStorage.setItem('venue', JSON.stringify(updatedVenue));
        
        // Update form data with the data returned from the server
        setFormData(updatedData);
        
        // Reset file selection state
        setSelectedFile(null);
        
        // Clear preview URL if it was a temporary one
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
      }
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
      setUploading(false);
    }
  };
  
  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (!venueId) {
      setError('Cannot update password: Venue ID is missing');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setUpdating(true);
    setSuccess('');
    setError('');
    
    try {
      await axios.put(`${API_URL}/venues/${venueId}`, { 
        password: passwordData.newPassword 
      });
      
      setSuccess('Password updated successfully!');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  // Determine which image URL to display
  const displayImageUrl = previewUrl || formData.photoUrl;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Venue Profile</h1>
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card title="Venue Information">
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 mb-1">
                    Venue ID
                  </label>
                  <input
                    type="text"
                    id="venueId"
                    value={venueId || ''}
                    disabled
                    className="input bg-gray-100 w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input w-full"
                    value={formData.email}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="input w-full"
                    value={formData.location}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      id="openingTime"
                      name="openingTime"
                      required
                      className="input w-full"
                      value={formatTimeForInput(formData.openingTime)}
                      onChange={handleTimeChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      id="closingTime"
                      name="closingTime"
                      required
                      className="input w-full"
                      value={formatTimeForInput(formData.closingTime)}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={updating || uploading}
                  >
                    {updating || uploading ? (
                      <span className="flex justify-center items-center">
                        <Spinner size="sm" className="mr-2" />
                        {uploading ? 'Uploading Photo...' : 'Saving...'}
                      </span>
                    ) : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
            
            <Card title="Venue Photo">
              <div className="space-y-4">
                {displayImageUrl ? (
                  <div className="text-center">
                    <img 
                      src={displayImageUrl} 
                      alt="Venue" 
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    {previewUrl && (
                      <p className="text-xs text-amber-600 mt-2">
                        *Preview only. Click "Save Changes" to upload.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No photo uploaded yet</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                
                <Button 
                  type="button" 
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="w-full"
                >
                  {displayImageUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </Card>
          </div>
          
          <Card title="Change Password">
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  className="input w-full"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  className="input w-full"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  className="input w-full"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VenueProfile;