import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import CreateCourseModal from '../classes/CreateCourseModal';
import ClassView from '../classes/ClassView';

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
          <div className="p-6">
            <ClassView 
              channelId={channelId} 
              channelName={activeChannel?.name}
            />
          </div>
        );
      
      case 'courses':
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-white">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Created</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Start by creating your first course. You can add students, schedule sessions, and manage course materials.
                </p>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowCreateCourse(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">Courses list goes here</div>
            )}
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