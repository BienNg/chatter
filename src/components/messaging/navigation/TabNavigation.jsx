import React from 'react';

/**
 * TabNavigation - Channel tab navigation component
 * Handles tab display and switching for channel content
 */
export const TabNavigation = ({ 
  tabs, 
  currentTab, 
  onTabSelect,
  channel,
  onChannelClick 
}) => {
  if (!channel) return null;

  return (
    <>
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onChannelClick}
            className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            #{channel.name}
          </button>
          <span className="ml-2 text-sm text-gray-500">
            {channel.members?.length || 0} members
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center px-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.label)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              currentTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}; 