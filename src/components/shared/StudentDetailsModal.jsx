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
    <div className="space-y-6">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading student data...</span>
        </div>
      )}
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Name</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('name', displayData.name)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'name' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium text-gray-900">{displayData.name}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Email</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('email', displayData.email)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'email' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="email"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-900">{displayData.email || 'No email provided'}</p>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-500">Phone</label>
              {!editField && (
                <button 
                  onClick={() => handleEditStart('phone', displayData.phone)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
                  </svg>
                </button>
              )}
            </div>
            {editField === 'phone' ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                    className="p-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleEditCancel}
                    className="p-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-900">{displayData.phone || 'No phone provided'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Location</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">Country</label>
            <div className="mt-1">
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
            <label className="block text-xs font-medium text-gray-500">City</label>
            <div className="mt-1">
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
      
      {/* Platform & Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Additional Information</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">Platform</label>
            <div className="mt-1">
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
            <label className="block text-xs font-medium text-gray-500">Categories</label>
            <div className="mt-1">
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
      
      {/* Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
          {!editField && (
            <button 
              onClick={() => handleEditStart('notes', displayData.notes)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
              </svg>
            </button>
          )}
        </div>
        
        {editField === 'notes' ? (
          <div className="mt-1 flex flex-col space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              autoFocus
            />
            <div className="flex space-x-2 justify-end">
              <button 
                onClick={() => handleEditSave(displayData.id || enrollment.studentId)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                Save
              </button>
              <button 
                onClick={handleEditCancel}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {displayData.notes || 'No notes available for this student.'}
            </p>
          </div>
        )}
      </div>
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