import React from 'react';
import { User } from 'lucide-react';
import { generateChannelUrl, getMiddleClickHandlers } from '../../../utils/navigation';
import { useDirectMessages } from '../../../hooks/useDirectMessages';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * TabNavigation - Channel tab navigation component
 * Handles tab display and switching for channel content
 * Shows appropriate header for DM channels vs regular channels
 */
export const TabNavigation = ({ 
  tabs, 
  currentTab, 
  onTabSelect,
  channel,
  onChannelClick 
}) => {
  const { getOtherParticipant, isDMChannel } = useDirectMessages();
  const { currentUser } = useAuth();

  if (!channel) return null;

  // Check if this is a DM channel and get the other participant
  const isDirectMessage = isDMChannel(channel);
  const otherParticipant = isDirectMessage ? getOtherParticipant(channel) : null;

  // Get display name for the channel header
  const getChannelDisplayName = () => {
    if (isDirectMessage && otherParticipant) {
      return otherParticipant.displayName || otherParticipant.fullName || otherParticipant.email?.split('@')[0] || 'Unknown User';
    }
    return channel.name;
  };

  // Get member count text
  const getMemberCountText = () => {
    if (isDirectMessage) {
      return 'Direct message';
    }
    return `${channel.members?.length || 0} members`;
  };

  // Get header icon
  const getHeaderIcon = () => {
    if (isDirectMessage) {
      return <User className="w-5 h-5 mr-2 text-gray-600" />;
    }
    return '#';
  };

  return (
    <>
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onChannelClick}
            className="flex items-center text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {getHeaderIcon()}
            {getChannelDisplayName()}
          </button>
          <span className="ml-2 text-sm text-gray-500">
            {getMemberCountText()}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center px-6 border-b">
        {tabs.map((tab) => {
          const tabUrl = generateChannelUrl(channel.id, tab.id);
          const middleClickHandlers = getMiddleClickHandlers(
            tabUrl,
            () => onTabSelect(tab.label)
          );

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.label)}
              {...middleClickHandlers}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
}; 