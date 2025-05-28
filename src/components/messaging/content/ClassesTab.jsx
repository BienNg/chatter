import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import CreateCourseModal from '../classes/CreateCourseModal';
import ClassDetailsView from '../classes/ClassDetailsView';

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
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Sub-tabs for Classes
  const classesSubTabs = [
    { id: 'courses', label: 'Courses' },
    { id: 'info', label: 'Info' }
  ];

  const handleCourseCreated = () => {
    setShowCreateCourse(false);
    // Keep on courses tab to show the newly created course
    // onSubTabSelect('courses');
  };

  // TODO: Replace with real courses data
  const courses = [];

  const renderSubTabContent = () => {
    const currentSubTab = subTab || 'courses';
    
    switch (currentSubTab) {
      case 'info':
        return (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <p>Info tab content coming soon...</p>
            </div>
          </div>
        );
      
      case 'courses':
      default:
        return (
          <div className="h-full">
            <ClassDetailsView 
              channelId={channelId} 
              channelName={activeChannel?.name}
            />
          </div>
        );
    }
  };

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
      <div className="flex-1 overflow-y-auto">
        {renderSubTabContent()}
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateCourse}
        onClose={() => setShowCreateCourse(false)}
        onCreate={handleCourseCreated}
        channelName={activeChannel?.name}
        channelId={channelId}
      />
    </div>
  );
}; 