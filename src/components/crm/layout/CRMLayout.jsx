import React from 'react';
import { Sidebar } from '../../messaging/layout/Sidebar';
import { MainContent } from '../../messaging/layout/MainContent';

/**
 * CRMLayout - Main CRM layout component
 * Provides the basic layout structure for the CRM system
 */
export const CRMLayout = ({ 
  children,
  userProfile,
  currentUser,
  onLogout
}) => {
  return (
    <div className="flex h-screen">
      {/* Left Navigation Bar */}
      <Sidebar 
        userProfile={userProfile}
        currentUser={currentUser}
        onLogout={onLogout}
        activeSection="crm"
      />

      {/* Main Content Area */}
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}; 