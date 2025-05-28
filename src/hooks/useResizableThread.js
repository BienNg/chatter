import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useResizableThread - Custom hook for managing resizable thread functionality
 * Provides drag-to-resize capability for thread panel positioned from the right
 */
export const useResizableThread = (initialWidth = 384, minWidth = 300, maxWidth = 600) => {
  const [threadWidth, setThreadWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = threadWidth;
    
    // Add cursor style and prevent text selection
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('resizing');
  }, [threadWidth]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    // For right-positioned panel, we subtract deltaX to resize from left edge
    const deltaX = startXRef.current - e.clientX;
    const newWidth = startWidthRef.current + deltaX;
    
    // Constrain width within min/max bounds
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    setThreadWidth(constrainedWidth);
  }, [isResizing, minWidth, maxWidth]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    
    // Remove cursor style and restore text selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('resizing');
  }, [isResizing]);

  // Add/remove global event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Persist thread width to localStorage
  useEffect(() => {
    localStorage.setItem('chatter-thread-width', threadWidth.toString());
  }, [threadWidth]);

  // Load thread width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('chatter-thread-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= minWidth && width <= maxWidth) {
        setThreadWidth(width);
      }
    }
  }, [minWidth, maxWidth]);

  return {
    threadWidth,
    isResizing,
    handleMouseDown,
    setThreadWidth
  };
}; 