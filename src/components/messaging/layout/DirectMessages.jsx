import React from 'react';

/**
 * DirectMessages - Direct message contacts display
 * Handles direct message user list (placeholder for now)
 */
export const DirectMessages = () => {
  // TODO: Replace with real direct messages data
  const directMessages = [
    { id: 1, name: 'Sarah Johnson', initial: 'S', color: 'bg-green-500' },
    { id: 2, name: 'Alex Chen', initial: 'A', color: 'bg-blue-500' }
  ];

  return (
    <div className="px-4 py-2">
      <h2 className="text-sm font-semibold text-indigo-300 mb-2">DIRECT MESSAGES</h2>
      <div className="space-y-1">
        {directMessages.map((dm) => (
          <button 
            key={dm.id}
            className="flex items-center w-full px-2 py-1 rounded text-indigo-200 hover:bg-indigo-700/50 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full ${dm.color} flex items-center justify-center text-white text-xs mr-2`}>
              {dm.initial}
            </div>
            <span className="truncate">{dm.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 