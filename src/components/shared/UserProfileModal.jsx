import React from 'react';
import { X, LogOut, User, Mail, Calendar, Clock } from 'lucide-react';

/**
 * UserProfileModal - Displays user information and logout option
 */
const UserProfileModal = ({ isOpen, onClose, userProfile, currentUser, onLogout }) => {
  if (!isOpen) return null;

  // Format date to be more readable
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">User Profile</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Avatar and Name */}
        <div className="px-6 py-5 flex items-center border-b border-gray-200">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
            {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
          </div>
          <div className="ml-4">
            <h4 className="text-xl font-semibold text-gray-800">
              {userProfile?.fullName || 'User'}
            </h4>
            <p className="text-gray-500">
              {userProfile?.role || 'Member'}
            </p>
          </div>
        </div>

        {/* User Information */}
        <div className="px-6 py-4">
          <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Account Information
          </h5>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-gray-800">{currentUser?.uid || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{currentUser?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-gray-800">{formatDate(currentUser?.metadata?.creationTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Last Sign In</p>
                <p className="text-gray-800">{formatDate(currentUser?.metadata?.lastSignInTime)}</p>
              </div>
            </div>
          </div>
          
          {/* Additional User Profile Information */}
          {userProfile && Object.keys(userProfile).length > 0 && (
            <div className="mt-5">
              <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Profile Information
              </h5>
              <div className="bg-gray-50 p-3 rounded-md">
                {Object.entries(userProfile)
                  .filter(([key]) => !['fullName', 'role'].includes(key)) // Skip already displayed fields
                  .map(([key, value]) => (
                    <div key={key} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-800">
                        {typeof value === 'boolean' 
                          ? value ? 'Yes' : 'No'
                          : typeof value === 'object' && value !== null
                            ? JSON.stringify(value)
                            : String(value)
                        }
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Footer with Logout Button */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
