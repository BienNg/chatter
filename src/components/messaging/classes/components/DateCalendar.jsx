import React from 'react';

const DateCalendar = ({
  type, // 'start' or 'end'
  form,
  setForm,
  month,
  year,
  navigateMonth,
  formatDateString,
  isToday,
  monthNames,
  label,
  showAutoGenerate = false,
  AutoGenerateComponent = null
}) => {
  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevMonthDays = Array.from(
    { length: firstDayOfMonth }, 
    (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1
  );
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - firstDayOfMonth - daysInMonth;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const selectedDate = type === 'start' ? form.beginDate : form.endDate;
  const dateField = type === 'start' ? 'beginDate' : 'endDate';

  const handleDateClick = (day) => {
    const dateString = formatDateString(year, month, day);
    const isSelected = selectedDate === dateString;
    
    if (type === 'start') {
      if (isSelected) {
        setForm(prev => ({ ...prev, beginDate: '', endDate: '' }));
      } else {
        setForm(prev => ({ ...prev, beginDate: dateString, endDate: '' }));
      }
    } else {
      // End date logic
      const startDate = form.beginDate ? new Date(form.beginDate) : null;
      const currentDate = new Date(dateString);
      const isBeforeStart = startDate && currentDate < startDate;
      
      if (!isBeforeStart) {
        if (isSelected) {
          setForm(prev => ({ ...prev, endDate: '' }));
        } else {
          setForm(prev => ({ ...prev, endDate: dateString }));
        }
      }
    }
  };

  const isDayDisabled = (day) => {
    if (type === 'start') return false;
    
    const dateString = formatDateString(year, month, day);
    const startDate = form.beginDate ? new Date(form.beginDate) : null;
    const currentDate = new Date(dateString);
    return startDate && currentDate < startDate;
  };

  const isDayInRange = (day) => {
    if (type === 'start') return false;
    
    const dateString = formatDateString(year, month, day);
    const isSelected = selectedDate === dateString;
    const startDate = form.beginDate ? new Date(form.beginDate) : null;
    const currentDate = new Date(dateString);
    const isBeforeStart = startDate && currentDate < startDate;
    
    return form.beginDate && !isSelected && !isBeforeStart && (
      form.endDate && currentDate < new Date(form.endDate) && currentDate > startDate
    );
  };

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
          {label}
        </div>
        {showAutoGenerate && AutoGenerateComponent && (
          <AutoGenerateComponent form={form} />
        )}
      </label>
      
      <div className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
        selectedDate 
          ? 'border-indigo-300' 
          : 'border-gray-200 group-hover:border-indigo-200'
      }`}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button" 
            onClick={() => navigateMonth('prev')}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900">{monthNames[month]} {year}</h4>
          </div>
          <button 
            type="button" 
            onClick={() => navigateMonth('next')}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={`${type}-day-${index}`} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Previous month days */}
          {prevMonthDays.map((day, index) => (
            <button 
              key={`prev-${day}`} 
              type="button" 
              className="h-8 flex items-center justify-center text-sm text-gray-300 rounded-md"
            >
              {day}
            </button>
          ))}
          
          {/* Current month days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateString = formatDateString(year, month, day);
            const isSelected = selectedDate === dateString;
            const isTodayDate = isToday(day);
            const isDisabled = isDayDisabled(day);
            const isInRange = isDayInRange(day);
            
            return (
              <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDateClick(day)}
                className={`h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : isInRange
                    ? 'bg-indigo-50 text-indigo-700'
                    : isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isTodayDate
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
          
          {/* Next month days */}
          {nextMonthDays.map((day, index) => (
            <button 
              key={`next-${day}`} 
              type="button" 
              className="h-8 flex items-center justify-center text-sm text-gray-300 rounded-md"
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateCalendar; 