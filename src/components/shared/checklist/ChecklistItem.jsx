import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Zap, Edit2, MoreVertical, MessageSquare, FileText, X, Save } from 'lucide-react';
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
 * @param {string} props.description - Description text of the checklist item
 * @param {function} props.onDescriptionChange - Callback when description is saved
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
  onAddChannelMessage,
  description = '',
  onDescriptionChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDescriptionActive, setIsDescriptionActive] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const inputRef = useRef(null);
  const menuButtonRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // When entering edit mode, focus the input
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // When showing description input, focus it
  useEffect(() => {
    if (isDescriptionActive && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isDescriptionActive]);

  // Update edit value when title changes externally
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Update description value when description changes externally
  useEffect(() => {
    setDescriptionValue(description);
    if (description) {
      setIsDescriptionActive(true);
    }
  }, [description]);

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
    setIsDescriptionActive(true);
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

  const handleDescriptionChange = (e) => {
    setDescriptionValue(e.target.value);
  };

  const handleDescriptionSave = (e) => {
    e.stopPropagation();
    if (onDescriptionChange) {
      onDescriptionChange(id, descriptionValue);
    }
    // Keep description active if there's content, hide it otherwise
    if (!descriptionValue.trim()) {
      setIsDescriptionActive(false);
    } else {
      // Always close edit mode after saving
      setIsDescriptionActive(false);
    }
  };

  const handleDescriptionCancel = (e) => {
    e.stopPropagation();
    setDescriptionValue(description);
    // Hide description field only if it was empty initially
    if (!description) {
      setIsDescriptionActive(false);
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave(e);
    } else if (e.key === 'Escape') {
      handleDescriptionCancel(e);
    }
  };

  return (
    <div 
      className={`flex flex-col p-2 group/item hover:bg-gray-50 rounded-lg transition-colors ${!completed && !automated ? 'cursor-pointer' : ''}`}
      onClick={handleRowClick}
    >
      <div className="flex items-center">
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
      </div>

      {/* Description Field */}
      {isDescriptionActive && (
        <div className="mt-2 ml-8 relative">
          <div className="relative">
            <textarea
              ref={descriptionInputRef}
              value={descriptionValue}
              onChange={handleDescriptionChange}
              onKeyDown={handleDescriptionKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add a description..."
              className="w-full min-h-[60px] p-3 pl-4 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-600"
            />
            <div className="flex items-center justify-end space-x-2 mt-2">
              <button
                onClick={handleDescriptionCancel}
                className="text-xs flex items-center justify-center space-x-1 px-2 py-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleDescriptionSave}
                className="text-xs flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read-only Description Display */}
      {description && !isDescriptionActive && (
        <div 
          className="mt-2 ml-8 pl-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-indigo-50/50 rounded-r-lg"
          onClick={(e) => {
            e.stopPropagation();
            setIsDescriptionActive(true);
          }}
        >
          {description}
        </div>
      )}

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