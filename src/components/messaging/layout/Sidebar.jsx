import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  DollarSign, 
  Settings 
} from 'lucide-react';

/**
 * Sidebar - Left navigation bar component
 * Handles main app navigation and user profile display
 */
export const Sidebar = ({ userProfile, currentUser, onLogout, activeSection }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active section from URL if not explicitly provided
  const currentSection = activeSection || (location.pathname.startsWith('/crm') ? 'crm' : 'messaging');

  const getUserInitial = () => {
    return userProfile?.fullName?.charAt(0) || 
           currentUser?.email?.charAt(0) || 
           'U';
  };

  const handleNavigateToMessaging = () => {
    navigate('/channels');
  };

  const handleNavigateToCRM = () => {
    navigate('/crm');
  };

  const getButtonClasses = (section) => {
    const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center transition-colors";
    const activeClasses = "bg-indigo-800 text-white";
    const inactiveClasses = "hover:bg-indigo-800 text-indigo-300";
    
    return `${baseClasses} ${currentSection === section ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="w-16 bg-indigo-900 flex flex-col items-center py-4">
      {/* App Logo */}
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6">
        <MessageSquare className="w-6 h-6 text-indigo-600" />
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col items-center space-y-4">
        <button 
          onClick={handleNavigateToMessaging}
          className={getButtonClasses('messaging')}
          title="Messaging"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNavigateToCRM}
          className={getButtonClasses('crm')}
          title="CRM System"
        >
          <Users className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center text-indigo-300 transition-colors">
          <DollarSign className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center space-y-4">
        <button className="w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center text-indigo-300 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onLogout}
          className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm hover:bg-indigo-700 transition-colors"
          title="User Profile"
        >
          {getUserInitial()}
        </button>
      </div>
    </div>
  );
}; 