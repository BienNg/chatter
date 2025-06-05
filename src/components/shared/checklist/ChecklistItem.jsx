import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Zap, Edit2, MoreVertical, MessageSquare, FileText } from 'lucide-react';
import ReactDOM from 'react-dom';

/**
 * ChecklistItem - Reusable component for individual checklist items
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the checklist item
 * @param {string} props.title - Title text of the checklist item
 * @param {boolean} props.completed - Whether the item is completed
 * @param {boolean} props.automated - Whether the item is automated
 * @param {function} props.onStatusChange - Callback when status changes
 * @param {function} props.onStartClick - Callback when start button is clicked
 * @param {function} props.onTitleChange - Callback when title is edited
 * @param {function} props.onAddDescription - Callback when add description is clicked
 * @param {function} props.onAddChannelMessage - Callback when add channel message is clicked
 */
export const ChecklistItem = ({ 
  id, 
  title = 'Task item', 
  completed = false, 
  automated = false,
  onStatusChange,
  onStartClick,
  onTitleChange,
  onAddDescription,
  onAddChannelMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);
  const menuButtonRef = useRef(null);

  // When entering edit mode, focus the input
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update edit value when title changes externally
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleCheckClick = (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(id, !completed);
    }
  };

  const handleStartClick = (e) => {
    e.stopPropagation();
    if (onStartClick) {
      onStartClick(id);
    }
  };
  
  const handleRowClick = (e) => {
    if (!completed && !automated && !isEditing) {
      setIsEditing(true);
    }
  };
  
  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    saveChanges();
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };
  
  const saveChanges = () => {
    if (editValue.trim() && editValue !== title) {
      if (onTitleChange) {
        onTitleChange(id, editValue);
      }
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const StatusIcon = completed ? CheckCircle2 : automated ? Zap : Circle;

  // Menu handling
  const updateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate optimal position
      let top = rect.bottom + 4; // 4px margin below button
      let left = rect.right - 180; // Align right edge with button (menu width: 180px)
      
      // If menu would go below viewport, position above
      if (top + 120 > viewportHeight) {
        top = rect.top - 120 - 4; // 4px margin above button
      }
      
      // If menu would go off left edge, align left edge with button
      if (left < 8) {
        left = rect.left;
      }
      
      // If menu would go off right edge, align right edge with viewport
      if (left + 180 > viewportWidth - 8) {
        left = viewportWidth - 180 - 8;
      }
      
      setMenuPosition({ top, left });
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    
    updateMenuPosition();
    setIsMenuOpen(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        const menuElement = document.querySelector('[data-checklist-item-menu]');
        if (!menuElement || !menuElement.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleAddDescription = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onAddDescription) {
      onAddDescription(id);
    }
  };

  const handleAddChannelMessage = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onAddChannelMessage) {
      onAddChannelMessage(id);
    }
  };

  return (
    <div 
      className={`flex items-center p-2 group/item hover:bg-gray-50 rounded-lg transition-colors ${!completed && !automated ? 'cursor-pointer' : ''}`}
      onClick={handleRowClick}
    >
      <div className="flex-shrink-0 mr-3">
        <div 
          onClick={handleCheckClick}
          className="cursor-pointer"
        >
          <StatusIcon 
            className={`w-5 h-5 ${
              completed 
                ? 'text-green-500' 
                : automated 
                  ? 'text-indigo-500' 
                  : 'text-gray-300'
            }`} 
          />
        </div>
      </div>
      <div className="flex-grow">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm py-1 px-0 focus:outline-none text-gray-700"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`text-sm ${completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
            {title}
          </span>
        )}
      </div>
      <div className="flex-shrink-0 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
        {!automated && !completed && !isEditing && (
          <button 
            ref={menuButtonRef}
            onClick={toggleMenu}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-150 focus:outline-none"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu - Rendered as Portal */}
      {isMenuOpen && ReactDOM.createPortal(
        <div 
          data-checklist-item-menu
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{ 
            top: menuPosition.top,
            left: menuPosition.left,
            width: '180px',
            minWidth: '180px'
          }}
        >
          <div className="py-1">
            <button
              onClick={handleAddDescription}
              className="w-full px-4 py-2 text-left text-sm flex items-center text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            >
              <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
              Add Description
            </button>
            <button
              onClick={handleAddChannelMessage}
              className="w-full px-4 py-2 text-left text-sm flex items-center text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            >
              <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
              Add Channel Message
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}; 