import React from 'react';
import { CheckCircle2, Timer, Circle } from 'lucide-react';
import { ChecklistItem } from './ChecklistItem';

/**
 * ChecklistStage - Reusable component for checklist stages with timeline visualization
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the stage
 * @param {string} props.title - Title of the stage
 * @param {React.Component} props.icon - Icon component for the stage
 * @param {string} props.color - Color class for the stage (e.g., 'bg-blue-500')
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {Array} props.tasks - Array of task objects
 * @param {function} props.onTaskStatusChange - Callback when task status changes
 * @param {function} props.onTaskStart - Callback when task start button is clicked
 */
export const ChecklistStage = ({ 
  id, 
  title, 
  icon: StageIcon, 
  color, 
  progress = 0, 
  tasks = [], 
  onTaskStatusChange,
  onTaskStart 
}) => {
  const getStageStatusIcon = () => {
    if (progress === 100) return CheckCircle2;
    if (progress > 0) return Timer;
    return Circle;
  };
  
  const StatusIcon = getStageStatusIcon();

  return (
    <div className="relative mb-8">
      {/* Stage Node */}
      <div className="absolute left-6 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center"
           style={{ borderColor: color.replace('bg-', '').replace('blue-500', '#3b82f6').replace('indigo-500', '#6366f1').replace('purple-500', '#a855f7').replace('green-500', '#10b981').replace('emerald-500', '#10b981') }}>
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
      </div>
      
      {/* Stage Content */}
      <div className="ml-16 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
              <StageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                {title}
                <StatusIcon className={`w-4 h-4 ${progress === 100 ? 'text-green-500' : progress > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              </h3>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <ChecklistItem
              key={task.id}
              id={task.id}
              title={task.title}
              completed={task.completed}
              automated={task.automated}
              onStatusChange={onTaskStatusChange}
              onStartClick={onTaskStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 