import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import firebaseTracker, { startTracking, stopTracking, getStats, getRecentOperations, enableDebugMode, importTrackedListeners } from '../utils/comprehensiveFirebaseTracker';
import ManagerFirebaseDashboard from '../components/shared/ManagerFirebaseDashboard';
import ProtectedComponent from '../components/shared/ProtectedComponent';
import { getActiveListeners } from '../utils/listenerTrackingUtils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AdvancedFirebaseMonitorContext = createContext({});

export const useAdvancedFirebaseMonitor = () => useContext(AdvancedFirebaseMonitorContext);

export const AdvancedFirebaseMonitorProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [currentStats, setCurrentStats] = useState(null);
  const [recentOperations, setRecentOperations] = useState([]);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(3000);
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);

  // Start tracking when component mounts
  useEffect(() => {
    // Initialize listener
    startTracking((operation) => {
      // Real-time callback for each operation
      console.log('📊 Firebase Operation:', operation);
    });
    
    setIsTracking(true);
    
    // Cleanup function
    return () => {
      stopTracking();
      setIsTracking(false);
    };
  }, []);

  // Load channels and users
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get channels from Firestore
        const channelsRef = collection(db, 'channels');
        const channelsSnap = await getDocs(channelsRef);
        const channelsData = channelsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChannels(channelsData);

        // Get users from Firestore
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const usersData = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading channels and users:', error);
      }
    };

    loadData();
  }, []);

  // Refresh stats periodically
  useEffect(() => {
    if (!isTracking) return;
    
    const interval = setInterval(() => {
      // Get stats
      const stats = getStats();
      setCurrentStats(stats);
      
      // Get recent operations
      const operations = getRecentOperations();
      setRecentOperations(operations);
      
      // Import tracked listeners from our custom tracking system
      const activeTrackedListeners = getActiveListeners();
      if (activeTrackedListeners.length > 0) {
        importTrackedListeners(activeTrackedListeners);
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [isTracking, refreshInterval]);

  // Get current session summary
  const getSessionSummary = useCallback(() => {
    if (!currentStats) return null;

    const { session, last5min, alerts, realtimeListeners } = currentStats;
    
    return {
      totalOperations: session.totalOperations,
      totalReads: session.totalReads,
      totalWrites: session.totalWrites,
      totalCost: session.totalCost,
      readsPerMinute: last5min.readsPerMinute,
      activeListeners: realtimeListeners.active,
      hasAlerts: alerts.length > 0,
      criticalAlerts: alerts.filter(a => a.type === 'warning').length,
      sessionDuration: session.duration
    };
  }, [currentStats]);

  // Check if monitoring should show alert badge
  const shouldShowAlert = useCallback(() => {
    if (!currentStats) return false;
    
    const { alerts, last5min } = currentStats;
    
    // Show alert if there are warnings or high activity
    return alerts.some(a => a.type === 'warning') || last5min.readsPerMinute > 30;
  }, [currentStats]);

  // Get quick status for minimal UI
  const getQuickStatus = useCallback(() => {
    if (!currentStats) {
      return {
        status: 'Loading...',
        color: 'gray',
        reads: 0,
        cost: 0,
        readsPerMinute: 0
      };
    }

    const { session, last5min, alerts } = currentStats;
    const hasWarnings = alerts.some(a => a.type === 'warning');
    
    let status = 'Normal';
    let color = 'green';
    
    if (hasWarnings || last5min.readsPerMinute > 50) {
      status = 'High Activity';
      color = 'orange';
    } else if (last5min.readsPerMinute > 20) {
      status = 'Active';
      color = 'blue';
    }

    return {
      status,
      color,
      reads: session.totalReads,
      cost: session.totalCost,
      readsPerMinute: last5min.readsPerMinute
    };
  }, [currentStats]);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    if (!isDebugMode) {
      enableDebugMode();
    }
    setIsDebugMode(!isDebugMode);
  }, [isDebugMode]);

  // Toggle dashboard visibility
  const toggleDashboard = useCallback(() => {
    setIsDashboardVisible(!isDashboardVisible);
  }, [isDashboardVisible]);

  return (
    <AdvancedFirebaseMonitorContext.Provider
      value={{
        isTracking,
        isDashboardVisible,
        toggleDashboard,
        toggleDebugMode,
        isDebugMode,
        setRefreshInterval,
        currentStats,
        recentOperations,
        getSessionSummary,
        getQuickStatus,
        shouldShowAlert
      }}
    >
      {children}
      
      <ProtectedComponent roles={['admin', 'manager', 'developer']}>
        {isDashboardVisible && (
          <ManagerFirebaseDashboard 
            stats={currentStats}
            recentOperations={recentOperations}
            isVisible={isDashboardVisible}
            onToggle={toggleDashboard}
            channels={channels}
            users={users}
          />
        )}
      </ProtectedComponent>
    </AdvancedFirebaseMonitorContext.Provider>
  );
};

// Hook for managers who don't need technical details
export const useManagerDashboard = () => {
  const {
    isDashboardVisible,
    toggleDashboard,
    getSessionSummary,
    getQuickStatus,
    shouldShowAlert
  } = useAdvancedFirebaseMonitor();

  return {
    isDashboardVisible,
    toggleDashboard,
    sessionSummary: getSessionSummary ? getSessionSummary() : null,
    quickStatus: getQuickStatus ? getQuickStatus() : { status: 'Loading...', color: 'gray', reads: 0, cost: 0 },
    hasAlerts: shouldShowAlert ? shouldShowAlert() : false
  };
};

// Hook for developers who need technical access
export const useDeveloperMonitor = () => {
  const {
    isTracking,
    currentStats,
    recentOperations
  } = useAdvancedFirebaseMonitor();

  return {
    isTracking,
    stats: currentStats,
    operations: recentOperations
  };
}; 