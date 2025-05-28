import React from 'react';
import DateCalendar from './DateCalendar';
import AutoGenerateTooltip from './AutoGenerateTooltip';

const WEEKDAYS = [
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
  { key: 'Sun', label: 'S' },
];

const CourseSchedule = ({
  form,
  setForm,
  startMonth,
  setStartMonth,
  startYear,
  setStartYear,
  endMonth,
  setEndMonth,
  endYear,
  setEndYear,
  navigateStartMonth,
  navigateEndMonth,
  formatDateString,
  isStartToday,
  isEndToday,
  monthNames
}) => {
  const handleDayToggle = (dayKey) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(dayKey)
        ? prev.days.filter((d) => d !== dayKey)
        : [...prev.days, dayKey],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Course Days */}
      <div className="flex items-center space-x-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Days</label>
          <div className="flex space-x-2">
            {WEEKDAYS.map((d) => (
              <button
                type="button"
                key={d.key}
                className={`w-9 h-9 rounded-full border text-sm font-medium transition-colors focus:outline-none ${form.days.includes(d.key) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleDayToggle(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-20">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
          <input
            type="number"
            min="1"
            max="99"
            value={form.totalDays}
            onChange={(e) => {
              const value = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
              setForm(prev => ({ ...prev, totalDays: value }));
            }}
            className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
          />
        </div>
      </div>

      {/* Date Selectors Row */}
      <div className="grid grid-cols-2 gap-10">
        {/* Start Date Calendar */}
        <DateCalendar
          type="start"
          form={form}
          setForm={setForm}
          month={startMonth}
          year={startYear}
          navigateMonth={navigateStartMonth}
          formatDateString={formatDateString}
          isToday={isStartToday}
          monthNames={monthNames}
          label="Start Date"
        />

        {/* End Date Calendar */}
        <DateCalendar
          type="end"
          form={form}
          setForm={setForm}
          month={endMonth}
          year={endYear}
          navigateMonth={navigateEndMonth}
          formatDateString={formatDateString}
          isToday={isEndToday}
          monthNames={monthNames}
          label="End Date"
          showAutoGenerate={true}
          AutoGenerateComponent={AutoGenerateTooltip}
        />
      </div>
    </div>
  );
};

export default CourseSchedule; 