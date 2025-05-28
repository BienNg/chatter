import React, { useState, useRef } from 'react';

const AutoGenerateTooltip = ({ form }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  const isDisabled = !(form.days.length > 0 && form.totalDays && form.beginDate && form.formatOption);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (isDisabled) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    // Add a delay before hiding the tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300); // 300ms delay
  };

  const handleTooltipMouseEnter = () => {
    // Clear timeout when mouse enters tooltip
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    // Hide tooltip when mouse leaves tooltip
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          disabled={!isDisabled}
          className={`text-sm font-medium flex items-center transition-colors ${
            !isDisabled
              ? 'text-indigo-600 hover:text-indigo-700 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto-generate
        </button>
      </div>
      
      {/* Tooltip - Only show when button is disabled and hovering */}
      {showTooltip && (
        <div 
          className="absolute -top-20 left-0 px-3 py-2 bg-black text-white text-sm rounded-lg shadow-lg whitespace-nowrap"
          style={{ zIndex: 99999 }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="font-medium mb-1">Fill required fields:</div>
          <div className="text-xs space-y-0.5">
            {form.days.length === 0 && <div>• Course Days</div>}
            {!form.totalDays && <div>• Total Days</div>}
            {!form.beginDate && <div>• Start Date</div>}
            {!form.formatOption && <div>• Location</div>}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

export default AutoGenerateTooltip; 