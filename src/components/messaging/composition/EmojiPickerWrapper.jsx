import React, { useRef, useEffect, useState } from 'react';
import EmojiPicker from './EmojiPicker';

const EmojiPickerWrapper = ({ onEmojiSelect, onClose, className = '', triggerRef }) => {
  const wrapperRef = useRef(null);
  const [position, setPosition] = useState({ top: false, bottom: true, left: true, right: false });

  useEffect(() => {
    if (!wrapperRef.current || !triggerRef?.current) return;

    const updatePosition = () => {
      const wrapper = wrapperRef.current;
      const trigger = triggerRef.current;
      
      if (!wrapper || !trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate available space
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      // Determine vertical position
      const pickerHeight = 400; // max height of emoji picker
      const shouldShowAbove = spaceBelow < pickerHeight && spaceAbove > spaceBelow;

      // Determine horizontal position
      const pickerWidth = 380; // width of emoji picker
      const shouldShowRight = spaceLeft < pickerWidth && spaceRight > spaceLeft;

      setPosition({
        top: shouldShowAbove,
        bottom: !shouldShowAbove,
        left: !shouldShowRight,
        right: shouldShowRight
      });
    };

    // Update position on mount and scroll/resize
    updatePosition();
    
    const handleUpdate = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [triggerRef]);

  const getPositionClasses = () => {
    let classes = 'absolute z-[1000] ';
    
    if (position.top) {
      classes += 'bottom-full mb-2 ';
    } else {
      classes += 'top-full mt-2 ';
    }
    
    if (position.left) {
      classes += 'left-0 ';
    } else {
      classes += 'right-0 ';
    }
    
    return classes;
  };

  return (
    <div 
      ref={wrapperRef}
      className={getPositionClasses()}
    >
      <EmojiPicker
        onEmojiSelect={onEmojiSelect}
        onClose={onClose}
        className={className}
      />
    </div>
  );
};

export default EmojiPickerWrapper; 