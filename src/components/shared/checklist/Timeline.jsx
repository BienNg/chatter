import React from 'react';
import { ChecklistStage } from './ChecklistStage';

/**
 * Timeline - Reusable component for rendering a timeline of checklist stages
 * 
 * @param {Object} props
 * @param {Array} props.stages - Array of stage objects
 * @param {function} props.onTaskStatusChange - Callback when task status changes
 * @param {function} props.onTaskStart - Callback when task start button is clicked
 * @param {function} props.onAddTask - Callback when a new task is added
 */
export const Timeline = ({ 
  stages = [], 
  onTaskStatusChange, 
  onTaskStart,
  onAddTask 
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
          />
        ))}
      </div>
    </div>
  );
}; 