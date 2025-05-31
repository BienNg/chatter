import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, BookOpen, CreditCard } from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useEnrollments } from '../../hooks/useEnrollments';
import { usePayments } from '../../hooks/usePayments';
import { useCountries } from '../../hooks/useCountries';
import { useCities } from '../../hooks/useCities';
import { usePlatforms } from '../../hooks/usePlatforms';
import { useCategories } from '../../hooks/useCategories';
import FirebaseCollectionSelector from './FirebaseCollectionSelector';
import FirebaseMultiSelectSelector from './FirebaseMultiSelectSelector';
import { useFieldEdit } from '../../hooks/useFieldEdit';

const StudentDetailsModal = ({ 
  enrollment,
  isOpen, 
  onClose
}) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [activeTab, setActiveTab] = useState('info');
  const [studentData, setStudentData] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hooks
  const { getStudentById, updateStudent, addStudent } = useStudents();
  const { getStudentEnrollments } = useEnrollments();
  const { getPaymentsByStudent } = usePayments();
  const { countries, addCountry } = useCountries();
  const { cities, addCity } = useCities();
  const { platforms, addPlatform } = usePlatforms();
  const { categories, addCategory } = useCategories();

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Load student data when modal opens
  useEffect(() => {
    const loadStudentData = async () => {
      if (!enrollment?.studentId || !isOpen) return;
      
      setLoading(true);
      try {
        // Try to load student details from database
        const student = await getStudentById(enrollment.studentId);
        setStudentData(student);
        console.log('Successfully loaded student data from database:', student);
      } catch (error) {
        // Student record doesn't exist in database - this is fine, we'll use enrollment data
        console.log('Student record not found in database, using enrollment data as fallback');
        setStudentData(null);
      }

      try {
        // Load student enrollments
        const enrollments = await getStudentEnrollments(enrollment.studentId);
        setStudentEnrollments(enrollments);

        // Load student payments
        const payments = await getPaymentsByStudent(enrollment.studentId);
        setStudentPayments(payments);
      } catch (error) {
        console.error('Error loading student enrollments or payments:', error);
        // Set empty arrays as fallback
        setStudentEnrollments([]);
        setStudentPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [enrollment?.studentId, isOpen, getStudentById, getStudentEnrollments, getPaymentsByStudent]);

  // Enhanced update function that handles the case where student record doesn't exist
  const updateStudentRecord = async (studentId, updates) => {
    try {
      // If we don't have a database ID, use the enrollment's studentId
      const actualStudentId = studentData?.id || enrollment?.studentId;
      
      console.log('Updating student with ID:', actualStudentId);
      console.log('Updates:', updates);
      
      if (!actualStudentId) {
        throw new Error('No valid student ID found');
      }

      // If we don't have a student record in the database, create one first
      if (!studentData) {
        console.log('Creating new student record since none exists in database');
        const newStudentData = {
          name: enrollment?.studentName,
          email: enrollment?.studentEmail,
          studentId: enrollment?.studentId,
          avatar: enrollment?.avatar,
          avatarColor: enrollment?.avatarColor,
          ...updates // Include the updates being made
        };
        
        // Use the addStudent function that's already available from the hook
        const newDocId = await addStudent(newStudentData);
        
        // Fetch the newly created student
        const newStudent = await getStudentById(newDocId);
        setStudentData(newStudent);
        
        console.log('Successfully created new student record:', newStudent);
        return;
      }

      // If student record exists, update it normally
      await updateStudent(actualStudentId, updates);
      
      // Refresh student data after update
      if (enrollment?.studentId) {
        const updatedStudent = await getStudentById(enrollment.studentId);
        setStudentData(updatedStudent);
      }
    } catch (error) {
      console.error('Error updating student record:', error);
      throw error;
    }
  };

  // Field editing hook with our custom update function
  const {
    editField,
    editValue,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    setEditValue
  } = useFieldEdit(updateStudentRecord);

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (!isOpen || !enrollment) return null;

  // Add additional safety check for enrollment data
  if (!enrollment.studentName && !enrollment.studentId) {
    console.warn('StudentDetailsModal: Invalid enrollment data received', enrollment);
    return null;
  }

  // Use enrollment data as fallback if student data not loaded
  const displayData = {
    // Start with enrollment data as base
    name: enrollment?.studentName || 'Unknown Student',
    email: enrollment?.studentEmail || '',
    studentId: enrollment?.studentId || '',
    avatar: enrollment?.avatar || enrollment?.studentName?.charAt(0)?.toUpperCase() || '?',
    avatarColor: enrollment?.avatarColor || '#6B7280',
    
    // Override with database student data if available
    ...(studentData || {}),
    
    // Ensure we always have an ID for operations
    id: studentData?.id || enrollment?.studentId
  };

  const renderStudentInfoTab = () => (
    <div className="space-y-8">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            <span className="text-sm font-medium text-gray-500">Loading student profile...</span>
          </div>
        </div>
      )}
      
      {!loading && (
        <>
          {/* Hero Section with Visual Identity */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 border border-indigo-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative flex items-center space-x-6">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white"
                  style={{ backgroundColor: displayData.avatarColor || '#6366F1' }}
                >
                  {displayData.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  {editField === 'name' ? (
                    <div className="flex-1 flex items-center space-x-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 text-2xl font-bold text-gray-900 bg-white border-2 border-indigo-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        autoFocus
                        placeholder="Enter student name"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{displayData.name}</h1>
                      <button 
                        onClick={() => handleEditStart('name', displayData.name)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all group"
                        title="Edit name"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">Student ID: {displayData.studentId || 'Not assigned'}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{studentEnrollments.length} Course{studentEnrollments.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{studentPayments.length} Payment{studentPayments.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    {!editField && (
                      <button 
                        onClick={() => handleEditStart('email', displayData.email)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                        title="Edit email"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {editField === 'email' ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        autoFocus
                        placeholder="student@example.com"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 flex-1">
                        {displayData.email || (
                          <span className="text-gray-500 italic">No email provided</span>
                        )}
                      </span>
                      {displayData.email && (
                        <a 
                          href={`mailto:${displayData.email}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Send
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    {!editField && (
                      <button 
                        onClick={() => handleEditStart('phone', displayData.phone)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                        title="Edit phone"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {editField === 'phone' ? (
                    <div className="space-y-3">
                      <input
                        type="tel"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        autoFocus
                        placeholder="+1 (555) 123-4567"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 flex-1">
                        {displayData.phone || (
                          <span className="text-gray-500 italic">No phone provided</span>
                        )}
                      </span>
                      {displayData.phone && (
                        <a 
                          href={`tel:${displayData.phone}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Call
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Country</label>
                  <div className="relative">
                    <FirebaseCollectionSelector
                      collectionName="countries"
                      record={displayData}
                      updateRecord={updateStudentRecord}
                      fieldName="location"
                      fieldDisplayName="Country"
                      options={countries}
                      addOption={addCountry}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">City</label>
                  <div className="relative">
                    <FirebaseCollectionSelector
                      collectionName="cities"
                      record={displayData}
                      updateRecord={updateStudentRecord}
                      fieldName="city"
                      fieldDisplayName="City"
                      options={cities}
                      addOption={addCity}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Details</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Learning Platform</label>
                  <div className="relative">
                    <FirebaseCollectionSelector
                      collectionName="platforms"
                      record={displayData}
                      updateRecord={updateStudentRecord}
                      fieldName="platform"
                      fieldDisplayName="Platform"
                      options={platforms}
                      addOption={addPlatform}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Interest Categories</label>
                  <div className="relative">
                    <FirebaseMultiSelectSelector
                      collectionName="categories"
                      record={displayData}
                      updateRecord={updateStudentRecord}
                      fieldName="categories"
                      fieldDisplayName="Category"
                      options={categories}
                      addOption={addCategory}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Card - Full Width */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Notes & Observations</h3>
                </div>
                {!editField && (
                  <button 
                    onClick={() => handleEditStart('notes', displayData.notes)}
                    className="px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all text-sm font-medium"
                  >
                    {displayData.notes ? 'Edit Notes' : 'Add Notes'}
                  </button>
                )}
              </div>
              
              {editField === 'notes' ? (
                <div className="space-y-4">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    rows="6"
                    autoFocus
                    placeholder="Add notes about this student's progress, behavior, special requirements, or any other relevant observations..."
                  />
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={handleEditCancel}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                      className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 min-h-[120px] relative group">
                  {displayData.notes ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {displayData.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No notes added yet</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add Notes" to record observations about this student</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6 p-1 h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Enrolled Courses</h3>
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors">
          Enroll in Course
        </button>
      </div>
      
      {studentEnrollments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[340px]">
          <BookOpen className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-500">No courses enrolled yet</p>
          <p className="text-xs text-gray-400 mt-2 max-w-sm">Enroll this student in a course to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentEnrollments.map((courseEnrollment, index) => (
            <div key={courseEnrollment.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{courseEnrollment.courseName}</h4>
                      <p className="text-xs text-gray-500">{courseEnrollment.courseLevel}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>Class: {courseEnrollment.className}</span>
                      <span>Enrolled: {new Date(courseEnrollment.enrollmentDate || courseEnrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6 p-1 h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Payment History</h3>
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors">
          Record Payment
        </button>
      </div>
      
      {studentPayments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[340px]">
          <CreditCard className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-500">No payment records found</p>
          <p className="text-xs text-gray-400 mt-2 max-w-sm">Record a payment to track this student's financial history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studentPayments.map((payment, index) => (
            <div key={payment.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: payment.currency || 'VND'
                        }).format(payment.amount || 0)}
                      </h4>
                      <p className="text-xs text-gray-500">{payment.courseName}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-4">
                      <span>Type: {payment.paymentType?.replace('_', ' ') || 'Payment'}</span>
                      <span>Date: {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {payment.notes && (
                      <p className="italic">"{payment.notes}"</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {payment.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'info':
        return renderStudentInfoTab();
      case 'courses':
        return renderCoursesTab();
      case 'payments':
        return renderPaymentsTab();
      default:
        return renderStudentInfoTab();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop - clickable to close but doesn't block background */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 pointer-events-auto ${
          isAnimating ? 'bg-black bg-opacity-20' : 'bg-transparent'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Panel - positioned to not block background */}
      <div className="fixed inset-y-0 right-0 flex justify-end pointer-events-none">
        <div 
          className={`w-[1200px] transform transition-transform duration-300 ease-out pointer-events-auto ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0"
                  style={{ backgroundColor: displayData.avatarColor || '#6B7280' }}
                >
                  {displayData.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{displayData.name}</h2>
                </div>
              </div>
              
              <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-100">
              <div className="flex space-x-8 px-6">
                <button
                  className={`py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'info' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Student Information
                </button>
                <button
                  className={`py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'courses' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('courses')}
                >
                  Courses
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-gray-600 bg-gray-100 rounded-full">
                    {studentEnrollments.length}
                  </span>
                </button>
                <button
                  className={`py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'payments' 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-gray-600 bg-gray-100 rounded-full">
                    {studentPayments.length}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;