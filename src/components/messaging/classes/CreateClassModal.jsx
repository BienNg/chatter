import React, { useState, useRef } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useLevels } from '../../../hooks/useLevels';
import { useTypes } from '../../../hooks/useTypes';
import { useTeachers } from '../../../hooks/useTeachers';

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

const CreateClassModal = ({ isOpen, onClose, onCreate, channelName }) => {
  const { levels, addLevel } = useLevels();
  const { types, addType } = useTypes();
  const { teachers, addTeacher } = useTeachers();
  const [form, setForm] = useState({
    className: channelName ? channelName.toUpperCase() : '',
    level: '',
    format: 'Online',
    type: '',
    teachers: [],
    beginDate: '',
    endDate: '',
    days: [],
    sheetUrl: '',
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

  React.useEffect(() => {
    if (isOpen && channelName && !form.className) {
      setForm((prev) => ({ ...prev, className: channelName.toUpperCase() }));
    }
    // eslint-disable-next-line
  }, [isOpen, channelName]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onCreate) onCreate(form);
      onClose();
    }, 800);
  };

  const handleLevelSelect = (level) => {
    setForm((prev) => ({ ...prev, level }));
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Class</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  placeholder="Enter class name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              {/* Level - custom dropdown */}
              <div className="relative" ref={levelRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <div className="flex space-x-4">
                {FORMATS.map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors focus:outline-none ${form.format === fmt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setForm((prev) => ({ ...prev, format: fmt }))}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
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
              
              {/* Selected Teachers Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {form.teachers.map((teacher, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {teacher}
                    <button
                      type="button"
                      onClick={() => handleRemoveTeacher(teacher)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={teacherSearchValue}
                  onChange={(e) => setTeacherSearchValue(e.target.value)}
                  onFocus={() => setTeacherDropdown(true)}
                  placeholder="Search teachers..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* Dropdown */}
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
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Begin Date</label>
                <input
                  type="date"
                  name="beginDate"
                  value={form.beginDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            {/* Class Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Days</label>
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
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Class'}
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

export default CreateClassModal; 