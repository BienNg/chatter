import React from 'react';
import { ChecklistStage } from './ChecklistStage';
import { Plus } from 'lucide-react';

/**
 * Timeline - Reusable component for rendering a timeline of checklist stages
 * 
 * @param {Object} props
 * @param {Array} props.stages - Array of stage objects
 * @param {function} props.onTaskStatusChange - Callback when task status changes
 * @param {function} props.onTaskStart - Callback when task start button is clicked
 * @param {function} props.onAddTask - Callback when a new task is added
 * @param {function} props.onReorderTasks - Callback when tasks are reordered
 * @param {function} props.onTitleChange - Callback when stage title is edited
 * @param {function} props.onTaskTitleChange - Callback when task title is edited
 * @param {function} props.onAddTemplate - Callback when new template button is clicked
 * @param {function} props.onAddTaskDescription - Callback when add description is clicked for a task
 * @param {function} props.onAddTaskChannelMessage - Callback when add channel message is clicked for a task
 * @param {function} props.onTaskDescriptionChange - Callback when task description is changed
 */
export const Timeline = ({ 
  stages = [], 
  onTaskStatusChange, 
  onTaskStart,
  onAddTask,
  onReorderTasks,
  onTitleChange,
  onTaskTitleChange,
  onAddTemplate,
  onAddTaskDescription,
  onAddTaskChannelMessage,
  onTaskDescriptionChange
}) => {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="relative min-h-full">
        {/* Timeline Line */}
        <div 
          className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500" 
          style={{ height: 'calc(100% - 2rem)' }}
        ></div>
        
        {stages.map((stage) => (
          <ChecklistStage
            key={stage.id}
            id={stage.id}
            title={stage.title}
            icon={stage.icon}
            color={stage.color}
            progress={stage.progress}
            tasks={stage.tasks}
            onTaskStatusChange={onTaskStatusChange}
            onTaskStart={onTaskStart}
            onAddTask={onAddTask}
            onReorderTasks={onReorderTasks}
            onTitleChange={onTitleChange}
            onTaskTitleChange={onTaskTitleChange}
            onAddTaskDescription={onAddTaskDescription}
            onAddTaskChannelMessage={onAddTaskChannelMessage}
            onTaskDescriptionChange={onTaskDescriptionChange}
          />
        ))}
        
        {/* New Template Button */}
        <div className="relative mb-8">
          <div className="absolute left-6 w-4 h-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
          
          <div className="ml-16">
            <button 
              onClick={onAddTemplate}
              className="w-full bg-white rounded-xl border border-gray-200 border-dashed p-6 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex items-center justify-center group"
            >
              <div className="flex items-center space-x-2 text-gray-500 group-hover:text-indigo-600">
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Stage</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 