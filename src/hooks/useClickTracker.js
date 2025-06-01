import { useFirebaseLogger } from '../contexts/FirebaseLoggerContext';
import { useLocation } from 'react-router-dom';

export const useClickTracker = () => {
  const { logUserClick } = useFirebaseLogger();
  const location = useLocation();

  const trackClick = (elementName, additionalData = {}) => {
    // Get current page from route
    const currentPage = location.pathname.includes('/crm') 
      ? 'CRM' 
      : location.pathname.includes('/bookkeeping') 
      ? 'Bookkeeping' 
      : location.pathname.includes('/channels') 
      ? 'Messaging' 
      : 'Unknown';

    logUserClick(elementName, currentPage, {
      route: location.pathname,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  };

  // Higher-order function to wrap click handlers
  const wrapClickHandler = (elementName, originalHandler, additionalData = {}) => {
    return (...args) => {
      trackClick(elementName, additionalData);
      if (originalHandler) {
        return originalHandler(...args);
      }
    };
  };

  // Helper to create click-tracked button props
  const createTrackedButtonProps = (elementName, onClick, additionalData = {}) => ({
    onClick: wrapClickHandler(elementName, onClick, additionalData)
  });

  return {
    trackClick,
    wrapClickHandler,
    createTrackedButtonProps
  };
}; 