import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  DollarSign, 
  Settings 
} from 'lucide-react';
import { useTabPersistence } from '../../../hooks/useTabPersistence';

/**
 * Sidebar - Left navigation bar component
 * Handles main app navigation and user profile display
 */
export const Sidebar = ({ userProfile, currentUser, onLogout, activeSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLastMessagingState } = useTabPersistence();

  // Determine active section from URL if not explicitly provided
  const getCurrentSection = () => {
    if (activeSection) return activeSection;
    if (location.pathname.startsWith('/crm')) return 'crm';
    if (location.pathname.startsWith('/bookkeeping')) return 'bookkeeping';
    return 'messaging';
  };

  const currentSection = getCurrentSection();

  const getUserInitial = () => {
    return userProfile?.fullName?.charAt(0) || 
           currentUser?.email?.charAt(0) || 
           'U';
  };

  const handleNavigateToMessaging = () => {
    // Try to restore the last messaging state
    const lastMessagingState = getLastMessagingState();
    
    if (lastMessagingState && lastMessagingState.channelId) {
      // Restore the complete state: channel + tab + sub-tab
      const { channelId, tab, subTab } = lastMessagingState;
      
      let targetPath = `/channels/${channelId}/${tab}`;
      
      // Add sub-tab path if it exists
      if (subTab && tab === 'classes') {
        targetPath += `/${subTab}`;
      }
      
      navigate(targetPath);
    } else {
      // Fallback to default channels route
      navigate('/channels');
    }
  };

  const handleNavigateToCRM = () => {
    navigate('/crm');
  };

  const handleNavigateToBookkeeping = () => {
    navigate('/bookkeeping');
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
        <button 
          onClick={handleNavigateToBookkeeping}
          className={getButtonClasses('bookkeeping')}
          title="Bookkeeping"
        >
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