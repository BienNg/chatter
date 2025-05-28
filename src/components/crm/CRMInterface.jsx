import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CRMLayout } from './layout';
import { ComingSoon } from './content';

/**
 * CRMInterface - Main CRM application component
 * Handles the CRM system interface with coming soon content
 */
const CRMInterface = () => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <CRMLayout
      userProfile={userProfile}
      currentUser={currentUser}
      onLogout={logout}
    >
      <ComingSoon />
    </CRMLayout>
  );
};

export default CRMInterface; 