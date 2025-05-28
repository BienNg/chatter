import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import CreateClassModal from '../classes/CreateClassModal';

/**
 * ClassesTab - Classes tab content component
 * Handles class management and display
 */
export const ClassesTab = ({
  channelId,
  subTab,
  onSubTabSelect,
  activeChannel
}) => {
  const [showCreateClass, setShowCreateClass] = useState(false);

  // Sub-tabs for Classes
  const classesSubTabs = [
    { id: 'courses', label: 'Courses' },
    { id: 'info', label: 'Info' }
  ];

  // TODO: Replace with real classes data
  const classes = [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Classes Sub-tabs */}
      <div className="flex items-center px-6 border-b bg-gray-50">
        {classesSubTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubTabSelect(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              (subTab || 'courses') === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Content */}
      <div className="flex-1 flex items-center justify-center bg-white">
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Created</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Start by creating your first class. You can add students, schedule sessions, and manage course materials.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              onClick={() => setShowCreateClass(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Class
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500">Classes list goes here</div>
        )}
      </div>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateClass}
        onClose={() => setShowCreateClass(false)}
        onCreate={() => setShowCreateClass(false)}
        channelName={activeChannel?.name}
      />
    </div>
  );
}; 