import React from 'react';
import { Sidebar } from './Sidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MainContent } from './MainContent';

/**
 * AppLayout - Main application layout component
 * Handles the three-column layout structure
 */
export const AppLayout = ({ 
  children,
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
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
      />

      {/* Channels Sidebar */}
      <ChannelSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelSelect={onChannelSelect}
        onCreateChannel={onCreateChannel}
      />

      {/* Main Content Area */}
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
}; 