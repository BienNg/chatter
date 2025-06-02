import React from 'react';
import { Circle, CheckSquare, Zap } from 'lucide-react';

/**
 * ChecklistItem - Reusable component for checklist items
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the checklist item
 * @param {string} props.title - Title text of the checklist item
 * @param {boolean} props.completed - Whether the item is completed
 * @param {boolean} props.automated - Whether the item is automated
 * @param {function} props.onStatusChange - Callback when status changes
 * @param {function} props.onStartClick - Callback when start button is clicked
 * @param {string} props.actionLabel - Custom label for the action button (defaults to "Start")
 */
export const ChecklistItem = ({ 
  id, 
  title, 
  completed = false, 
  automated = false, 
  onStatusChange, 
  onStartClick,
  actionLabel = "Start"
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        completed 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div 
          className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer ${
            completed ? 'bg-green-500 text-white' : 'bg-gray-300'
          }`}
          onClick={() => onStatusChange && onStatusChange(id, !completed)}
        >
          {completed ? <CheckSquare className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
        </div>
        <span className={`font-medium ${completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
          {title}
        </span>
        {automated && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <Zap className="w-3 h-3 mr-1" />
            Auto
          </span>
        )}
      </div>
      
      {!completed && onStartClick && (
        <button 
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          onClick={() => onStartClick(id)}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}; 