import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();

  // Fetch all enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!currentUser?.uid) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        orderBy('enrollmentDate', 'desc')
      );
      
      const snapshot = await getDocs(enrollmentsQuery);
      const enrollmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        enrollmentDate: doc.data().enrollmentDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Get enrollments for a specific student
  const getStudentEnrollments = useCallback((studentId) => {
    if (!studentId) return [];
    
    return enrollments.filter(enrollment => 
      enrollment.studentId === studentId
    );
  }, [enrollments]);

  // Get enrollments for a specific course
  const getCourseEnrollments = useCallback((courseId) => {
    if (!courseId) return [];
    
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  }, [enrollments]);

  // Get enrollments for a specific class
  const getClassEnrollments = useCallback((classId) => {
    if (!classId) return [];
    
    return enrollments.filter(enrollment => enrollment.classId === classId);
  }, [enrollments]);

  // Enroll a student in a course
  const enrollStudent = async (enrollmentData) => {
    try {
      setError(null);
      
      console.log('Enrolling student with data:', enrollmentData);
      console.log('Current user:', currentUser);
      
      // Validate required fields
      if (!enrollmentData.studentId) {
        throw new Error('Student ID is required for enrollment');
      }
      
      if (!enrollmentData.studentName) {
        throw new Error('Student name is required for enrollment');
      }
      
      if (!currentUser?.uid) {
        throw new Error('User must be authenticated to enroll students');
      }
      
      // Check if student is already enrolled in this course
      const existingEnrollment = enrollments.find(
        enrollment => 
          enrollment.studentId === enrollmentData.studentId && 
          enrollment.courseId === enrollmentData.courseId
      );
      
      if (existingEnrollment) {
        throw new Error('Student is already enrolled in this course');
      }
      
      const timestamp = serverTimestamp();
      const newEnrollment = {
        studentId: enrollmentData.studentId, // Reference to students collection
        courseId: enrollmentData.courseId, // Reference to courses collection
        classId: enrollmentData.classId, // Reference to classes collection
        
        // Denormalized student data for efficient queries
        studentName: enrollmentData.studentName,
        studentEmail: enrollmentData.studentEmail,
        
        // Denormalized course data for efficient queries
        courseName: enrollmentData.courseName,
        courseLevel: enrollmentData.courseLevel,
        
        // Denormalized class data for efficient queries
        className: enrollmentData.className,
        
        // Enrollment specific data
        status: enrollmentData.status || 'active', // active, completed, dropped, suspended
        progress: enrollmentData.progress || 0, // 0-100
        attendance: enrollmentData.attendance || 0, // 0-100
        grade: enrollmentData.grade || null, // Final grade
        
        // Payment information
        amount: enrollmentData.amount || 0,
        currency: enrollmentData.currency || 'VND',
        paymentStatus: enrollmentData.paymentStatus || 'pending', // pending, paid, partial, overdue
        
        // Dates
        enrollmentDate: timestamp,
        startDate: enrollmentData.startDate || null,
        endDate: enrollmentData.endDate || null,
        completionDate: enrollmentData.completionDate || null,
        
        // Additional information
        notes: enrollmentData.notes || '',
        
        // Metadata
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser.uid
      };
      
      console.log('Creating enrollment document:', newEnrollment);
      
      const docRef = await addDoc(collection(db, 'enrollments'), newEnrollment);
      
      console.log('Enrollment created successfully with ID:', docRef.id);
      
      // Add to local state immediately for better UX
      const enrollmentWithId = {
        ...newEnrollment,
        id: docRef.id,
        enrollmentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setEnrollments(prev => [enrollmentWithId, ...prev]);
      
      return docRef.id;
    } catch (err) {
      console.error('Error enrolling student:', err);
      console.error('Enrollment data that failed:', enrollmentData);
      console.error('Current user:', currentUser);
      setError(err.message || 'Failed to enroll student');
      throw err;
    }
  };

  // Update enrollment
  const updateEnrollment = async (enrollmentId, updates) => {
    try {
      setError(null);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'enrollments', enrollmentId), updateData);
      
      // Update local state
      setEnrollments(prev => prev.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, ...updates, updatedAt: new Date() }
          : enrollment
      ));
    } catch (err) {
      console.error('Error updating enrollment:', err);
      setError('Failed to update enrollment');
      throw err;
    }
  };

  // Update student progress
  const updateStudentProgress = async (enrollmentId, progress) => {
    try {
      await updateEnrollment(enrollmentId, { progress });
    } catch (err) {
      console.error('Error updating student progress:', err);
      throw err;
    }
  };

  // Update student attendance
  const updateStudentAttendance = async (enrollmentId, attendance) => {
    try {
      await updateEnrollment(enrollmentId, { attendance });
    } catch (err) {
      console.error('Error updating student attendance:', err);
      throw err;
    }
  };

  // Update enrollment status
  const updateEnrollmentStatus = async (enrollmentId, status, additionalData = {}) => {
    try {
      const updateData = { status, ...additionalData };
      
      // If completing the course, set completion date
      if (status === 'completed' && !additionalData.completionDate) {
        updateData.completionDate = new Date();
      }
      
      await updateEnrollment(enrollmentId, updateData);
    } catch (err) {
      console.error('Error updating enrollment status:', err);
      throw err;
    }
  };

  // Remove enrollment
  const removeEnrollment = async (enrollmentId) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      
      // Remove from local state
      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== enrollmentId));
    } catch (err) {
      console.error('Error removing enrollment:', err);
      setError('Failed to remove enrollment');
      throw err;
    }
  };

  // Get enrollment statistics
  const getEnrollmentStats = useCallback(() => {
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const droppedEnrollments = enrollments.filter(e => e.status === 'dropped').length;
    const suspendedEnrollments = enrollments.filter(e => e.status === 'suspended').length;
    
    const averageProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
      : 0;
    
    const averageAttendance = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.attendance || 0), 0) / enrollments.length)
      : 0;
    
    return {
      total: totalEnrollments,
      active: activeEnrollments,
      completed: completedEnrollments,
      dropped: droppedEnrollments,
      suspended: suspendedEnrollments,
      averageProgress,
      averageAttendance
    };
  }, [enrollments]);

  // Search enrollments
  const searchEnrollments = useCallback((searchTerm, filters = {}) => {
    let filtered = enrollments;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(enrollment =>
        enrollment.studentName?.toLowerCase().includes(term) ||
        enrollment.studentEmail?.toLowerCase().includes(term) ||
        enrollment.courseName?.toLowerCase().includes(term) ||
        enrollment.className?.toLowerCase().includes(term) ||
        enrollment.courseLevel?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(enrollment => enrollment.status === filters.status);
    }

    if (filters.courseId) {
      filtered = filtered.filter(enrollment => enrollment.courseId === filters.courseId);
    }

    if (filters.classId) {
      filtered = filtered.filter(enrollment => enrollment.classId === filters.classId);
    }

    if (filters.studentId) {
      filtered = filtered.filter(enrollment => enrollment.studentId === filters.studentId);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(enrollment => enrollment.paymentStatus === filters.paymentStatus);
    }

    return filtered;
  }, [enrollments]);

  // Get enrollment by ID
  const getEnrollmentById = useCallback((enrollmentId) => {
    return enrollments.find(enrollment => enrollment.id === enrollmentId);
  }, [enrollments]);

  // Check if student is enrolled in course
  const isStudentEnrolled = useCallback((studentId, courseId) => {
    return enrollments.some(enrollment => 
      enrollment.studentId === studentId && 
      enrollment.courseId === courseId &&
      enrollment.status !== 'dropped'
    );
  }, [enrollments]);

  return {
    enrollments,
    loading,
    error,
    getStudentEnrollments,
    getCourseEnrollments,
    getClassEnrollments,
    enrollStudent,
    updateEnrollment,
    updateStudentProgress,
    updateStudentAttendance,
    updateEnrollmentStatus,
    removeEnrollment,
    getEnrollmentStats,
    searchEnrollments,
    getEnrollmentById,
    isStudentEnrolled,
    refetch: fetchEnrollments
  };
}; 