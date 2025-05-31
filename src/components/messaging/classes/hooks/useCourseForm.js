import { useState, useRef, useEffect } from 'react';
import { useLevels } from '../../../../hooks/useLevels';
import { useTypes } from '../../../../hooks/useTypes';
import { useTeachers } from '../../../../hooks/useTeachers';
import { useCourses } from '../../../../hooks/useCourses';
import { useClasses } from '../../../../hooks/useClasses';

export const useCourseForm = (channelName, channelId, initialData, isEditing, isOpen) => {
  const { levels, addLevel } = useLevels();
  const { types, addType } = useTypes();
  const { teachers, addTeacher } = useTeachers();
  const { createCourse, updateCourse } = useCourses();
  const { getClassByChannelId } = useClasses();

  // State to store the classId
  const [classId, setClassId] = useState(null);

  // Form state
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

  // Dropdown states
  const [levelDropdown, setLevelDropdown] = useState(false);
  const levelRef = useRef(null);
  const [typeDropdown, setTypeDropdown] = useState(false);
  const typeRef = useRef(null);
  const [teacherDropdown, setTeacherDropdown] = useState(false);
  const teacherRef = useRef(null);
  const [teacherSearchValue, setTeacherSearchValue] = useState('');

  // New item modal states
  const [showNewLevelModal, setShowNewLevelModal] = useState(false);
  const [newLevelValue, setNewLevelValue] = useState('');
  const [addingLevel, setAddingLevel] = useState(false);
  const [levelError, setLevelError] = useState('');

  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [newTypeValue, setNewTypeValue] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [typeError, setTypeError] = useState('');

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

  // Helper functions
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

  // Handle new item functions
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
      setForm((prev) => ({ ...prev, level: newLevelValue.trim() }));
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
      setForm((prev) => ({ ...prev, type: newTypeValue.trim() }));
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

  const handleSubmit = async (e, onCreate, onClose) => {
    e.preventDefault();
    
    if (!channelId) {
      console.error('No channelId provided for course creation');
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

    setLoading(true);

    try {
      // Ensure we have a class ID
      let currentClassId = classId;
      if (!currentClassId) {
        const classData = await getClassByChannelId(channelId);
        if (classData) {
          setClassId(classData.id);
          currentClassId = classData.id;
        } else {
          throw new Error('No class found for this channel');
        }
      }

      // Construct the final course name
      const finalCourseName = `${form.className} - ${form.level} - ${form.format} - ${form.formatOption}`;

      let result;
      if (isEditing && initialData) {
        // Update existing course
        result = await updateCourse(initialData.id, {
          ...form,
          courseName: finalCourseName,
          courseType: form.type,
          googleDriveUrl: form.sheetUrl,
        });
      } else {
        // Create new course
        const courseData = {
          ...form,
          courseName: finalCourseName,
          courseType: form.type,
          googleDriveUrl: form.sheetUrl,
        };
        result = await createCourse(courseData, currentClassId);
      }

      if (onCreate) {
        onCreate(result);
      }

      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
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

  // Populate form with initial data when editing
  useEffect(() => {
    if (isOpen && isEditing && initialData) {
      let extractedClassName = initialData.courseName || initialData.className || '';
      if (initialData.level && extractedClassName.includes(` - ${initialData.level}`)) {
        extractedClassName = extractedClassName.replace(` - ${initialData.level}`, '');
      }
      
      setForm({
        className: extractedClassName,
        level: initialData.level || '',
        format: initialData.format || '',
        formatOption: initialData.formatOption || '',
        type: initialData.courseType || initialData.classType || '',
        teachers: initialData.teachers || [],
        beginDate: initialData.beginDate || '',
        endDate: initialData.endDate || '',
        days: initialData.days || [],
        sheetUrl: initialData.googleDriveUrl || '',
        totalDays: initialData.totalDays || '',
      });
    } else if (isOpen && !isEditing && !form.className) {
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
      setForm((prev) => ({ ...prev, className: channelName.toUpperCase() }));
    }
  }, [isOpen, isEditing, initialData, channelName]);

  // Reset calendar to current month when modal opens
  useEffect(() => {
    if (isOpen && !form.beginDate && !form.endDate) {
      setStartMonth(todayMonth);
      setStartYear(todayYear);
      setEndMonth(todayMonth);
      setEndYear(todayYear);
    }
  }, [isOpen, form.beginDate, form.endDate, todayMonth, todayYear]);

  // Update end calendar when start date is selected
  useEffect(() => {
    if (form.beginDate) {
      const startDate = new Date(form.beginDate);
      setEndMonth(startDate.getMonth());
      setEndYear(startDate.getFullYear());
    }
  }, [form.beginDate]);

  // Update end calendar when end date is set (for auto-generate)
  useEffect(() => {
    if (form.endDate) {
      const endDate = new Date(form.endDate);
      setEndMonth(endDate.getMonth());
      setEndYear(endDate.getFullYear());
    }
  }, [form.endDate]);

  // Update total days when format or level changes
  useEffect(() => {
    const newTotalDays = calculateTotalDays(form.format, form.level);
    if (newTotalDays !== form.totalDays) {
      setForm(prev => ({ ...prev, totalDays: newTotalDays }));
    }
  }, [form.format, form.level]);

  // Fetch class data when channelId changes
  useEffect(() => {
    const fetchClassData = async () => {
      if (channelId) {
        try {
          const classData = await getClassByChannelId(channelId);
          if (classData) {
            setClassId(classData.id);
          }
        } catch (error) {
          console.error('Error fetching class data:', error);
        }
      }
    };

    fetchClassData();
  }, [channelId, getClassByChannelId]);

  // Check if all required fields are filled
  const isFormValid = form.className.trim() && form.level.trim() && form.format.trim() && form.formatOption.trim();

  return {
    // Form state
    form,
    setForm,
    loading,
    isFormValid,
    
    // Data
    levels,
    types,
    teachers,
    
    // Dropdown states
    levelDropdown,
    setLevelDropdown,
    levelRef,
    typeDropdown,
    setTypeDropdown,
    typeRef,
    teacherDropdown,
    setTeacherDropdown,
    teacherRef,
    teacherSearchValue,
    setTeacherSearchValue,
    
    // New item modal states
    showNewLevelModal,
    setShowNewLevelModal,
    newLevelValue,
    setNewLevelValue,
    addingLevel,
    levelError,
    setLevelError,
    showNewTypeModal,
    setShowNewTypeModal,
    newTypeValue,
    setNewTypeValue,
    addingType,
    typeError,
    setTypeError,
    showNewTeacherModal,
    setShowNewTeacherModal,
    newTeacherValue,
    setNewTeacherValue,
    addingTeacher,
    teacherError,
    setTeacherError,
    
    // Calendar states
    startMonth,
    setStartMonth,
    startYear,
    setStartYear,
    endMonth,
    setEndMonth,
    endYear,
    setEndYear,
    monthNames,
    
    // Functions
    calculateTotalDays,
    isStartToday,
    isEndToday,
    formatDateString,
    navigateStartMonth,
    navigateEndMonth,
    handleNewLevelClick,
    handleAddNewLevel,
    handleNewTypeClick,
    handleAddNewType,
    handleNewTeacherClick,
    handleAddNewTeacher,
    handleClearForm,
    handleSubmit,
  };
}; 