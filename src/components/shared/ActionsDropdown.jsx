import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * ActionsDropdown - A reusable dropdown menu component for action buttons
 * 
 * @param {Object} props
 * @param {string} props.itemId - Unique identifier for the item this dropdown belongs to
 * @param {Array} props.actions - Array of action objects with structure: 
 *   { 
 *     key: 'unique-key', 
 *     label: 'Action Label', 
 *     icon: ReactComponent, 
 *     onClick: (item) => {}, 
 *     disabled?: boolean,
 *     loading?: boolean,
 *     className?: string,
 *     isDanger?: boolean 
 *   }
 * @param {Object} props.item - The data item this dropdown is for (passed to action handlers)
 * @param {boolean} props.disabled - Whether the dropdown trigger is disabled
 * @param {string} props.className - Additional CSS classes for the dropdown container
 * @param {number} props.dropdownWidth - Width of dropdown in rem units (default: 12rem)
 * @param {boolean} props.showSeparators - Whether to show separators between action groups
 */
const ActionsDropdown = ({ 
  itemId, 
  actions = [], 
  item, 
  disabled = false, 
  className = '',
  dropdownWidth = 12, // 12rem = 192px
  showSeparators = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');

  const handleDropdownToggle = (e) => {
    e.stopPropagation(); // Prevent parent element click events
    
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    
    // Calculate position based on button position
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.max(actions.length * 40 + 16, 100); // Approximate dropdown height
    
    // If there's not enough space below, position above
    const shouldPositionAbove = rect.bottom + dropdownHeight > viewportHeight;
    setDropdownPosition(shouldPositionAbove ? 'top' : 'bottom');
    
    setIsOpen(true);
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation(); // Prevent parent element click events
    setIsOpen(false); // Close dropdown
    
    if (action.onClick && !action.disabled) {
      action.onClick(item, e);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Group actions by separators
  const groupedActions = showSeparators 
    ? actions.reduce((groups, action, index) => {
        if (action.separator && groups.length > 0) {
          groups.push({ type: 'separator' });
        }
        groups.push(action);
        return groups;
      }, [])
    : actions;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleDropdownToggle}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        disabled={disabled}
        title="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ width: `${dropdownWidth}rem` }}
        >
          <div className="py-1">
            {groupedActions.map((action, index) => {
              // Render separator
              if (action.type === 'separator') {
                return (
                  <div key={`separator-${index}`} className="border-t border-gray-100 my-1"></div>
                );
              }

              // Determine button styling
              const baseClasses = "w-full px-4 py-2 text-left text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500";
              const normalClasses = "text-gray-700 hover:bg-gray-50";
              const dangerClasses = "text-red-600 hover:bg-red-50";
              const disabledClasses = "text-gray-400 cursor-not-allowed";
              
              let buttonClasses = baseClasses;
              if (action.disabled) {
                buttonClasses += ` ${disabledClasses}`;
              } else if (action.isDanger) {
                buttonClasses += ` ${dangerClasses}`;
              } else {
                buttonClasses += ` ${normalClasses}`;
              }
              
              if (action.className) {
                buttonClasses += ` ${action.className}`;
              }

              return (
                <button
                  key={action.key}
                  onClick={(e) => handleActionClick(action, e)}
                  className={buttonClasses}
                  disabled={action.disabled}
                  title={action.title}
                >
                  {action.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3"></div>
                      {action.loadingLabel || action.label}
                    </>
                  ) : (
                    <>
                      {action.icon && <action.icon className="h-4 w-4 mr-3 flex-shrink-0" />}
                      {action.label}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown; 