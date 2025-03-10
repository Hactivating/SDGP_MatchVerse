import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">Indoor Court Management</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-1 text-gray-500 hover:text-gray-800">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary"></span>
          </button>
          
          <div className="flex items-center">
            <div className="mr-2">
              <p className="text-sm font-medium text-gray-700">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">Venue Management</p>
            </div>
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;