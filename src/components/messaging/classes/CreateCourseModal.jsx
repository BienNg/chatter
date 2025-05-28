import React, { useState, useRef } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useLevels } from '../../../hooks/useLevels';
import { useTypes } from '../../../hooks/useTypes';
import { useTeachers } from '../../../hooks/useTeachers';
import { useClasses } from '../../../hooks/useClasses';

const WEEKDAYS = [
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
  { key: 'Sun', label: 'S' },
];
const FORMATS = ['Online', 'Offline'];

const CreateCourseModal = ({ isOpen, onClose, onCreate, channelName, channelId, initialData = null, isEditing = false }) => {
  const { levels, addLevel } = useLevels();
  const { types, addType } = useTypes();
  const { teachers, addTeacher } = useTeachers();
  const { createClass, updateClass } = useClasses();
  const [form, setForm] = useState({
    className: channelName ? channelName.toUpperCase() : '',
    level: '',
    format: '',
    formatOption: '',
    type: '',
    teachers: [],
    beginDate: '',
    endDate: '',
    days: [],
    sheetUrl: '',
    totalDays: '',
  });
  const [loading, setLoading] = useState(false);
  const [levelDropdown, setLevelDropdown] = useState(false);
  const levelRef = useRef(null);
  const [typeDropdown, setTypeDropdown] = useState(false);
  const typeRef = useRef(null);
  const [teacherDropdown, setTeacherDropdown] = useState(false);
  const teacherRef = useRef(null);
  const [teacherSearchValue, setTeacherSearchValue] = useState('');
  
  // New Level Modal state
  const [showNewLevelModal, setShowNewLevelModal] = useState(false);
  const [newLevelValue, setNewLevelValue] = useState('');
  const [addingLevel, setAddingLevel] = useState(false);
  const [levelError, setLevelError] = useState('');

  // New Type Modal state
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [newTypeValue, setNewTypeValue] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [typeError, setTypeError] = useState('');

  // New Teacher Modal state
  const [showNewTeacherModal, setShowNewTeacherModal] = useState(false);
  const [newTeacherValue, setNewTeacherValue] = useState('');
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  // Calendar states
  const today = new Date();
  const [startMonth, setStartMonth] = useState(today.getMonth());
  const [startYear, setStartYear] = useState(today.getFullYear());
  const [endMonth, setEndMonth] = useState(today.getMonth());
  const [endYear, setEndYear] = useState(today.getFullYear());
  
  // Get current date info
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Start calendar calculations
  const startDaysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const startFirstDayOfMonth = new Date(startYear, startMonth, 1).getDay();
  const startPrevMonth = startMonth === 0 ? 11 : startMonth - 1;
  const startPrevYear = startMonth === 0 ? startYear - 1 : startYear;
  const startDaysInPrevMonth = new Date(startPrevYear, startPrevMonth + 1, 0).getDate();
  const startPrevMonthDays = Array.from(
    { length: startFirstDayOfMonth }, 
    (_, i) => startDaysInPrevMonth - startFirstDayOfMonth + i + 1
  );
  const startTotalCells = 42; // 6 rows × 7 days
  const startRemainingCells = startTotalCells - startFirstDayOfMonth - startDaysInMonth;
  const startNextMonthDays = Array.from({ length: startRemainingCells }, (_, i) => i + 1);

  // End calendar calculations
  const endDaysInMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const endFirstDayOfMonth = new Date(endYear, endMonth, 1).getDay();
  const endPrevMonth = endMonth === 0 ? 11 : endMonth - 1;
  const endPrevYear = endMonth === 0 ? endYear - 1 : endYear;
  const endDaysInPrevMonth = new Date(endPrevYear, endPrevMonth + 1, 0).getDate();
  const endPrevMonthDays = Array.from(
    { length: endFirstDayOfMonth }, 
    (_, i) => endDaysInPrevMonth - endFirstDayOfMonth + i + 1
  );
  const endTotalCells = 42; // 6 rows × 7 days
  const endRemainingCells = endTotalCells - endFirstDayOfMonth - endDaysInMonth;
  const endNextMonthDays = Array.from({ length: endRemainingCells }, (_, i) => i + 1);

  const isStartToday = (day) => {
    return day === todayDate && startMonth === todayMonth && startYear === todayYear;
  };

  const isEndToday = (day) => {
    return day === todayDate && endMonth === todayMonth && endYear === todayYear;
  };

  const formatDateString = (year, month, day) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };
  
  const navigateStartMonth = (direction) => {
    if (direction === 'prev') {
      if (startMonth === 0) {
        setStartMonth(11);
        setStartYear(startYear - 1);
      } else {
        setStartMonth(startMonth - 1);
      }
    } else {
      if (startMonth === 11) {
        setStartMonth(0);
        setStartYear(startYear + 1);
      } else {
        setStartMonth(startMonth + 1);
      }
    }
  };

  const navigateEndMonth = (direction) => {
    // If no start date is selected, keep calendars in sync
    if (!form.beginDate) {
      navigateStartMonth(direction);
    }
    
    if (direction === 'prev') {
      if (endMonth === 0) {
        setEndMonth(11);
        setEndYear(endYear - 1);
      } else {
        setEndMonth(endMonth - 1);
      }
    } else {
      if (endMonth === 11) {
        setEndMonth(0);
        setEndYear(endYear + 1);
      } else {
        setEndMonth(endMonth + 1);
      }
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (levelRef.current && !levelRef.current.contains(event.target)) {
        setLevelDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setTypeDropdown(false);
      }
      if (teacherRef.current && !teacherRef.current.contains(event.target)) {
        setTeacherDropdown(false);
      }
    }
    if (levelDropdown || typeDropdown || teacherDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [levelDropdown, typeDropdown, teacherDropdown]);

  // Populate form with initial data when editing, preserve selections for new courses
  React.useEffect(() => {
    if (isOpen && isEditing && initialData) {
      // When editing, extract class name from course name by removing " - [level]" part
      let extractedClassName = initialData.className || '';
      if (initialData.level && extractedClassName.includes(` - ${initialData.level}`)) {
        extractedClassName = extractedClassName.replace(` - ${initialData.level}`, '');
      }
      
      setForm({
        className: extractedClassName,
        level: initialData.level || '',
        format: initialData.format || '',
        formatOption: initialData.formatOption || '',
        type: initialData.classType || '',
        teachers: initialData.teachers || [],
        beginDate: initialData.beginDate || '',
        endDate: initialData.endDate || '',
        days: initialData.days || [],
        sheetUrl: initialData.googleDriveUrl || '',
        totalDays: initialData.totalDays || '',
      });
    } else if (isOpen && !isEditing && !form.className) {
      // Only initialize form if it's completely empty (first time opening)
      setForm({
        className: channelName ? channelName.toUpperCase() : '',
        level: '',
        format: '',
        formatOption: '',
        type: '',
        teachers: [],
        beginDate: '',
        endDate: '',
        days: [],
        sheetUrl: '',
        totalDays: '',
      });
    } else if (isOpen && !isEditing && channelName && form.className !== channelName.toUpperCase()) {
      // Update class name if channel name changed but preserve other selections
      setForm((prev) => ({ ...prev, className: channelName.toUpperCase() }));
    }
  }, [isOpen, isEditing, initialData, channelName]);

  // Reset calendar to current month when modal opens and no dates are selected
  React.useEffect(() => {
    if (isOpen && !form.beginDate && !form.endDate) {
      setStartMonth(todayMonth);
      setStartYear(todayYear);
      setEndMonth(todayMonth);
      setEndYear(todayYear);
    }
  }, [isOpen, form.beginDate, form.endDate, todayMonth, todayYear]);

  // Update end calendar when start date is selected
  React.useEffect(() => {
    if (form.beginDate) {
      const startDate = new Date(form.beginDate);
      setEndMonth(startDate.getMonth());
      setEndYear(startDate.getFullYear());
    }
  }, [form.beginDate]);

  // Function to calculate total days based on format and level
  const calculateTotalDays = (format, level) => {
    if (!format || !level) return '';
    
    if (format === 'Offline') {
      return 20;
    }
    
    if (format === 'Online') {
      if (level === 'A1.1' || level === 'A1.2') {
        return 18;
      }
      if (level === 'A2.1' || level === 'A2.2' || level === 'B1.1' || level === 'B1.2') {
        return 20;
      }
    }
    
    return '';
  };

  // Update total days when format or level changes
  React.useEffect(() => {
    const newTotalDays = calculateTotalDays(form.format, form.level);
    if (newTotalDays !== form.totalDays) {
      setForm(prev => ({ ...prev, totalDays: newTotalDays }));
    }
  }, [form.format, form.level]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayKey) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(dayKey)
        ? prev.days.filter((d) => d !== dayKey)
        : [...prev.days, dayKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!channelId) {
      console.error('No channel ID provided');
      return;
    }
    
    // Validate required fields
    if (!form.className.trim()) {
      alert('Class name is required');
      return;
    }
    
    if (!form.level.trim()) {
      alert('Level is required');
      return;
    }
    
    if (!form.format.trim()) {
      alert('Format is required');
      return;
    }
    
    if (!form.formatOption.trim()) {
      alert('Location is required');
      return;
    }
    
    // Construct the final course name as "[Class Name] - [Level] - [Format] - [Location]"
    const finalCourseName = `${form.className} - ${form.level} - ${form.format} - ${form.formatOption}`;
    
    setLoading(true);
    try {
      let result;
      
      if (isEditing && initialData) {
        // Update existing course
        await updateClass(initialData.id, {
          className: finalCourseName,
          classType: form.type,
          format: form.format,
          formatOption: form.formatOption,
          googleDriveUrl: form.sheetUrl,
          teachers: form.teachers,
          level: form.level,
          beginDate: form.beginDate,
          endDate: form.endDate,
          days: form.days,
          totalDays: form.totalDays,
        });
        
        result = {
          ...initialData,
          className: finalCourseName,
          classType: form.type,
          format: form.format,
          formatOption: form.formatOption,
          googleDriveUrl: form.sheetUrl,
          teachers: form.teachers,
          level: form.level,
          beginDate: form.beginDate,
          endDate: form.endDate,
          days: form.days,
          totalDays: form.totalDays,
        };
      } else {
        // Create new course
        const courseData = {
          ...form,
          className: finalCourseName
        };
        result = await createClass(courseData, channelId);
      }
      
      // Call onCreate callback if provided
      if (onCreate) {
        onCreate(result);
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error saving course:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (level) => {
    setForm((prev) => ({ 
      ...prev, 
      level,
      totalDays: calculateTotalDays(prev.format, level)
    }));
    setLevelDropdown(false);
  };

  const handleTypeSelect = (type) => {
    setForm((prev) => ({ ...prev, type }));
    setTypeDropdown(false);
  };

  const handleTeacherSelect = (teacher) => {
    if (!form.teachers.includes(teacher)) {
      setForm((prev) => ({ ...prev, teachers: [...prev.teachers, teacher] }));
    }
    setTeacherDropdown(false);
    setTeacherSearchValue('');
  };

  const handleRemoveTeacher = (teacherToRemove) => {
    setForm((prev) => ({ 
      ...prev, 
      teachers: prev.teachers.filter(teacher => teacher !== teacherToRemove) 
    }));
  };

  const handleNewLevelClick = () => {
    setLevelDropdown(false);
    setLevelError('');
    setShowNewLevelModal(true);
  };

  const handleAddNewLevel = async (e) => {
    e.preventDefault();
    if (!newLevelValue.trim()) return;
    
    setAddingLevel(true);
    setLevelError('');
    try {
      await addLevel(newLevelValue.trim());
      // Select the new level in the form
      setForm((prev) => ({ ...prev, level: newLevelValue.trim() }));
      // Close modal and reset
      setShowNewLevelModal(false);
      setNewLevelValue('');
    } catch (error) {
      console.error('Error adding level:', error);
      setLevelError(error.message);
    } finally {
      setAddingLevel(false);
    }
  };

  const handleNewTypeClick = () => {
    setTypeDropdown(false);
    setTypeError('');
    setShowNewTypeModal(true);
  };

  const handleAddNewType = async (e) => {
    e.preventDefault();
    if (!newTypeValue.trim()) return;
    
    setAddingType(true);
    setTypeError('');
    try {
      await addType(newTypeValue.trim());
      // Select the new type in the form
      setForm((prev) => ({ ...prev, type: newTypeValue.trim() }));
      // Close modal and reset
      setShowNewTypeModal(false);
      setNewTypeValue('');
    } catch (error) {
      console.error('Error adding type:', error);
      setTypeError(error.message);
    } finally {
      setAddingType(false);
    }
  };

  const handleNewTeacherClick = () => {
    setTeacherDropdown(false);
    setTeacherError('');
    setShowNewTeacherModal(true);
  };

  const handleAddNewTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacherValue.trim()) return;
    
    setAddingTeacher(true);
    setTeacherError('');
    try {
      await addTeacher(newTeacherValue.trim());
      if (!form.teachers.includes(newTeacherValue.trim())) {
        setForm((prev) => ({ ...prev, teachers: [...prev.teachers, newTeacherValue.trim()] }));
      }
      setShowNewTeacherModal(false);
      setNewTeacherValue('');
    } catch (error) {
      console.error('Error adding teacher:', error);
      setTeacherError(error.message);
    } finally {
      setAddingTeacher(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    !form.teachers.includes(teacher.value) &&
    teacher.value.toLowerCase().includes(teacherSearchValue.toLowerCase())
  );

  const handleClearForm = () => {
    setForm({
      className: channelName ? channelName.toUpperCase() : '',
      level: '',
      format: '',
      formatOption: '',
      type: '',
      teachers: [],
      beginDate: '',
      endDate: '',
      days: [],
      sheetUrl: '',
      totalDays: '',
    });
  };

  // Check if all required fields are filled
  const isFormValid = form.className.trim() && form.level.trim() && form.format.trim() && form.formatOption.trim();

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-16">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* Class Name and Level Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Class Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                    <input
                      type="text"
                      name="className"
                      value={form.className}
                      onChange={handleChange}
                      placeholder="Enter class name (e.g., G35)"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Level - custom dropdown */}
                  <div className="relative" ref={levelRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
                      onClick={() => setLevelDropdown((open) => !open)}
                    >
                      <span className={`text-gray-900 ${!form.level ? 'text-gray-400' : ''}`}>{form.level || 'Select level'}</span>
                      <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {levelDropdown && (
                      <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                        {levels && levels.length > 0 && levels.map((lvl) => (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => handleLevelSelect(lvl.value)}
                            className={`w-full text-left px-4 py-2 text-sm ${form.level === lvl.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-900 hover:bg-gray-50'} transition-colors`}
                          >
                            {lvl.value}
                          </button>
                        ))}
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          type="button"
                          className="w-full flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                          onClick={handleNewLevelClick}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          New Level...
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Format */}
                <div className="flex items-end space-x-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                    <div className="flex space-x-4">
                      {FORMATS.map((fmt) => (
                        <button
                          type="button"
                          key={fmt}
                          className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none ${form.format === fmt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                          onClick={() => {
                            setForm((prev) => ({ 
                              ...prev, 
                              format: fmt,
                              formatOption: '',
                              totalDays: calculateTotalDays(fmt, prev.level)
                            }));
                          }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <div className="flex space-x-4">
                      {form.format === 'Online' ? (
                        <>
                          {['VN', 'DE'].map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none ${form.formatOption === option ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                              onClick={() => setForm((prev) => ({ ...prev, formatOption: option }))}
                            >
                              {option}
                            </button>
                          ))}
                        </>
                      ) : form.format === 'Offline' ? (
                        <>
                          {['Hanoi', 'Saigon'].map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none ${form.formatOption === option ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                              onClick={() => setForm((prev) => ({ ...prev, formatOption: option }))}
                            >
                              {option}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 py-1.5">Select format first</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Course Name Preview */}
                {form.className && form.level && form.format && form.formatOption && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="text-sm text-blue-700">
                        <span className="font-medium">Course Name Preview:</span> {form.className} - {form.level} - {form.format} - {form.formatOption}
                      </div>
                    </div>
                  </div>
                )}

                {/* Type - custom dropdown */}
                <div className="relative" ref={typeRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <button
                    type="button"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between"
                    onClick={() => setTypeDropdown((open) => !open)}
                  >
                    <span className={`text-gray-900 ${!form.type ? 'text-gray-400' : ''}`}>{form.type || 'Select type'}</span>
                    <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {typeDropdown && (
                    <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                      {types && types.length > 0 && types.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeSelect(t.value)}
                          className={`w-full text-left px-4 py-2 text-sm ${form.type === t.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-900 hover:bg-gray-50'} transition-colors`}
                        >
                          {t.value}
                        </button>
                      ))}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        type="button"
                        className="w-full flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                        onClick={handleNewTypeClick}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Type...
                      </button>
                    </div>
                  )}
                </div>

                {/* Teachers - multiple selection with tags */}
                <div className="relative" ref={teacherRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teachers</label>
                  <div className="relative">
                    <div className="w-full min-h-[42px] px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white flex flex-wrap items-center gap-1">
                      {form.teachers.map((teacher, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                        >
                          {teacher}
                          <button
                            type="button"
                            onClick={() => handleRemoveTeacher(teacher)}
                            className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
                          >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={teacherSearchValue}
                        onChange={(e) => setTeacherSearchValue(e.target.value)}
                        onFocus={() => setTeacherDropdown(true)}
                        placeholder={form.teachers.length === 0 ? "Search teachers..." : ""}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1"
                      />
                    </div>
                    {teacherDropdown && (
                      <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1 max-h-48 overflow-y-auto">
                        {filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher) => (
                            <button
                              key={teacher.id}
                              type="button"
                              onClick={() => handleTeacherSelect(teacher.value)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              {teacher.value}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            {teacherSearchValue ? 'No teachers found' : 'No more teachers available'}
                          </div>
                        )}
                        <div className="border-t border-gray-200 my-1" />
                        <button
                          type="button"
                          className="w-full flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                          onClick={handleNewTeacherClick}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          New Teacher...
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Sheets URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheets URL</label>
                  <input
                    type="url"
                    name="sheetUrl"
                    value={form.sheetUrl}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Right Column - Schedule */}
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
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                      Start Date
                    </label>
                    
                    <div className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                      form.beginDate 
                        ? 'border-indigo-300' 
                        : 'border-gray-200 group-hover:border-indigo-200'
                    }`}>
                      {/* Start Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          type="button" 
                          onClick={() => navigateStartMonth('prev')}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-gray-900">{monthNames[startMonth]} {startYear}</h4>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => navigateStartMonth('next')}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Days of Week */}
                      <div className="grid grid-cols-7 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                          <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Start Calendar Grid */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {/* Previous month days */}
                        {startPrevMonthDays.map((day, index) => (
                          <button 
                            key={`prev-${day}`} 
                            type="button" 
                            className="h-8 flex items-center justify-center text-sm text-gray-300 rounded-md"
                          >
                            {day}
                          </button>
                        ))}
                        
                        {/* Current month days */}
                        {Array.from({ length: startDaysInMonth }, (_, i) => i + 1).map((day) => {
                          const dateString = formatDateString(startYear, startMonth, day);
                          const isSelected = form.beginDate === dateString;
                          const isTodayDate = isStartToday(day);
                          
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setForm(prev => ({ ...prev, beginDate: '', endDate: '' }));
                                } else {
                                  setForm(prev => ({ ...prev, beginDate: dateString, endDate: '' }));
                                }
                              }}
                              className={`h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
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
                        {startNextMonthDays.map((day, index) => (
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

                  {/* End Date Calendar */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                        End Date
                      </div>
                      <button
                        type="button"
                        disabled={!(form.days.length > 0 && form.totalDays && form.beginDate)}
                        className={`text-sm font-medium flex items-center transition-colors ${
                          (form.days.length > 0 && form.totalDays && form.beginDate)
                            ? 'text-indigo-600 hover:text-indigo-700 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Auto-generate
                      </button>
                    </label>
                    
                    <div className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                      form.endDate 
                        ? 'border-indigo-300' 
                        : 'border-gray-200 group-hover:border-indigo-200'
                    }`}>
                      {/* Calendar Header with Generate Button */}
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          type="button" 
                          onClick={() => navigateEndMonth('prev')}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-gray-900">{monthNames[endMonth]} {endYear}</h4>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => navigateEndMonth('next')}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Days of Week */}
                      <div className="grid grid-cols-7 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                          <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* End Calendar Grid */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {/* Previous month days */}
                        {endPrevMonthDays.map((day, index) => (
                          <button 
                            key={`prev-${day}`} 
                            type="button" 
                            className="h-8 flex items-center justify-center text-sm text-gray-300 rounded-md"
                          >
                            {day}
                          </button>
                        ))}
                        
                        {/* Current month days */}
                        {Array.from({ length: endDaysInMonth }, (_, i) => i + 1).map((day) => {
                          const dateString = formatDateString(endYear, endMonth, day);
                          const isSelected = form.endDate === dateString;
                          const isTodayDate = isEndToday(day);
                          const startDate = form.beginDate ? new Date(form.beginDate) : null;
                          const currentDate = new Date(dateString);
                          
                          // Check if this date is before the start date
                          const isBeforeStart = startDate && currentDate < startDate;
                          
                          // Check if this date is in range between start and end
                          const isInRange = form.beginDate && !isSelected && !isBeforeStart && (
                            form.endDate && currentDate < new Date(form.endDate) && currentDate > startDate
                          );
                          
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isBeforeStart}
                              onClick={() => {
                                if (isSelected) {
                                  setForm(prev => ({ ...prev, endDate: '' }));
                                } else {
                                  setForm(prev => ({ ...prev, endDate: dateString }));
                                }
                              }}
                              className={`h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : isInRange
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : isBeforeStart
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
                        {endNextMonthDays.map((day, index) => (
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
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Form
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`px-4 py-2 rounded-lg transition ${
                  loading || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Course' : 'Create Course')
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Level Modal */}
      {showNewLevelModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Level</h3>
              <button 
                onClick={() => {
                  setShowNewLevelModal(false);
                  setNewLevelValue('');
                  setLevelError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNewLevel}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level Name</label>
                <input
                  type="text"
                  value={newLevelValue}
                  onChange={(e) => setNewLevelValue(e.target.value)}
                  placeholder="e.g., C1.1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoFocus
                />
                {levelError && (
                  <p className="mt-2 text-sm text-red-600">{levelError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLevelModal(false);
                    setNewLevelValue('');
                    setLevelError('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLevel || !newLevelValue.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingLevel ? 'Adding...' : 'Add Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Type Modal */}
      {showNewTypeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Type</h3>
              <button 
                onClick={() => {
                  setShowNewTypeModal(false);
                  setNewTypeValue('');
                  setTypeError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNewType}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type Name</label>
                <input
                  type="text"
                  value={newTypeValue}
                  onChange={(e) => setNewTypeValue(e.target.value)}
                  placeholder="e.g., Workshop"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoFocus
                />
                {typeError && (
                  <p className="mt-2 text-sm text-red-600">{typeError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTypeModal(false);
                    setNewTypeValue('');
                    setTypeError('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingType || !newTypeValue.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingType ? 'Adding...' : 'Add Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Teacher Modal */}
      {showNewTeacherModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Teacher</h3>
              <button 
                onClick={() => {
                  setShowNewTeacherModal(false);
                  setNewTeacherValue('');
                  setTeacherError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNewTeacher}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name</label>
                <input
                  type="text"
                  value={newTeacherValue}
                  onChange={(e) => setNewTeacherValue(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoFocus
                />
                {teacherError && (
                  <p className="mt-2 text-sm text-red-600">{teacherError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTeacherModal(false);
                    setNewTeacherValue('');
                    setTeacherError('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTeacher || !newTeacherValue.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingTeacher ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCourseModal; 