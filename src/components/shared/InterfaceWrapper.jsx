import React, { useEffect } from 'react';
import { useFirebaseLogger } from '../../contexts/FirebaseLoggerContext';
import { setFirebaseLogger, enableFirebaseLogging } from '../../utils/firebaseLogger';
import AdminMonitorButton from './AdminMonitorButton';

const InterfaceWrapper = ({ children }) => {
  const loggerFunctions = useFirebaseLogger();
  
  // Set up the Firebase logger reference and enable logging
  useEffect(() => {
    setFirebaseLogger(loggerFunctions);
    enableFirebaseLogging();
    
    // Cleanup function to disable logging when component unmounts
    return () => {
      // Note: We don't disable logging on unmount as other components might still need it
      // disableFirebaseLogging();
    };
  }, [loggerFunctions.logFirebaseRead, loggerFunctions.logFirebaseWrite]);

  return (
    <>
      {children}
      <AdminMonitorButton />
    </>
  );
};

export default InterfaceWrapper; 