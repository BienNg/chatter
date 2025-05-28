import React from 'react';

/**
 * ThreadResizeHandle - Draggable handle for resizing the thread panel
 * Positioned on the left side of the thread panel for right-to-left resizing
 */
export const ThreadResizeHandle = ({ onMouseDown, isResizing }) => {
  return (
    <div
      className={`
        absolute top-0 left-0 w-1 h-full cursor-col-resize group
        hover:bg-indigo-400 transition-colors duration-200
        ${isResizing ? 'bg-indigo-500' : 'bg-transparent'}
      `}
      onMouseDown={onMouseDown}
      title="Drag to resize thread panel"
    >
      {/* Invisible wider hit area for easier grabbing */}
      <div className="absolute -left-1 -right-1 top-0 bottom-0" />
      
      {/* Visual indicator on hover */}
      <div 
        className={`
          absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 
          bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none
          ${isResizing ? 'opacity-100' : ''}
        `}
      >
        {/* Grip dots */}
        <div className="flex flex-col items-center justify-center h-full space-y-0.5">
          <div className="w-0.5 h-0.5 bg-white rounded-full" />
          <div className="w-0.5 h-0.5 bg-white rounded-full" />
          <div className="w-0.5 h-0.5 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}; 