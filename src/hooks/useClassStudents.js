import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const useClassStudents = (classId = null) => {
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();

  // Fetch students for a specific class
  const fetchClassStudents = useCallback(async () => {
    if (!currentUser?.uid || !classId) {
      setClassStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const q = query(
        collection(db, 'classStudents'),
        where('classId', '==', classId)
        // Temporarily commented out while index builds - uncomment after a few minutes
        // orderBy('enrollmentDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        enrollmentDate: doc.data().enrollmentDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      setClassStudents(studentsData);
    } catch (err) {
      console.error('Error fetching class students:', err);
      setError('Failed to fetch class students');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, classId]);

  useEffect(() => {
    fetchClassStudents();
  }, [fetchClassStudents]);

  // Enroll a student in the class
  const enrollStudent = async (studentData) => {
    try {
      setError(null);
      
      // Only check for email duplicates if email is provided and not empty
      let existingByEmail = null;
      if (studentData.email && studentData.email.trim() !== '') {
        existingByEmail = classStudents.find(
          student => student.email?.toLowerCase() === studentData.email.toLowerCase()
        );
      }
      
      // Check if student is already enrolled by studentId (if provided)
      const existingByStudentId = studentData.studentId ? classStudents.find(
        student => student.studentId === studentData.studentId
      ) : null;
      
      if (existingByEmail) {
        throw new Error(`Student with email "${studentData.email}" is already enrolled in this class`);
      }
      
      if (existingByStudentId) {
        throw new Error(`Student is already enrolled in this class (ID: ${studentData.studentId})`);
      }
      
      const timestamp = serverTimestamp();
      
      // Generate a better avatar color based on the student's name using inline styles
      const avatarColors = [
        { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }, // indigo to purple
        { background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }, // blue to cyan
        { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }, // green to emerald
        { background: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)' }, // yellow to orange
        { background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)' }, // red to pink
        { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }, // purple to indigo
        { background: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)' }, // teal to blue
        { background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }  // orange to red
      ];
      
      // Generate color based on name hash for consistency
      const nameHash = studentData.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const selectedColor = avatarColors[nameHash % avatarColors.length];
      
      const newEnrollment = {
        classId,
        studentId: studentData.studentId || null, // Reference to students collection if exists
        name: studentData.name,
        email: studentData.email || '', // Ensure email is never undefined
        avatar: studentData.avatar || studentData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        avatarColor: studentData.avatarColor || selectedColor,
        amount: studentData.amount || 0,
        currency: studentData.currency || 'USD',
        enrollmentDate: timestamp,
        status: studentData.status || 'active',
        progress: studentData.progress || 0,
        attendance: studentData.attendance || 0,
        phone: studentData.phone || '',
        notes: studentData.notes || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: currentUser.uid
      };
      
      const docRef = await addDoc(collection(db, 'classStudents'), newEnrollment);
      
      // Add to local state immediately for better UX
      const enrollmentWithId = {
        ...newEnrollment,
        id: docRef.id,
        enrollmentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setClassStudents(prev => [enrollmentWithId, ...prev]);
      
      return docRef.id;
    } catch (err) {
      console.error('Error enrolling student:', err);
      
      // Don't set error state for duplicate enrollment errors as they're handled gracefully in the UI
      if (!err.message.includes('already enrolled')) {
        setError(err.message || 'Failed to enroll student');
      }
      
      throw err;
    }
  };

  // Update student enrollment information
  const updateStudentEnrollment = async (enrollmentId, updates) => {
    try {
      setError(null);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'classStudents', enrollmentId), updateData);
      
      // Update local state
      setClassStudents(prev => prev.map(student => 
        student.id === enrollmentId 
          ? { ...student, ...updates, updatedAt: new Date() }
          : student
      ));
    } catch (err) {
      console.error('Error updating student enrollment:', err);
      setError('Failed to update student enrollment');
      throw err;
    }
  };

  // Remove student from class
  const removeStudentFromClass = async (enrollmentId) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'classStudents', enrollmentId));
      
      // Remove from local state
      setClassStudents(prev => prev.filter(student => student.id !== enrollmentId));
    } catch (err) {
      console.error('Error removing student from class:', err);
      setError('Failed to remove student from class');
      throw err;
    }
  };

  // Update student progress
  const updateStudentProgress = async (enrollmentId, progress) => {
    try {
      await updateStudentEnrollment(enrollmentId, { progress });
    } catch (err) {
      console.error('Error updating student progress:', err);
      throw err;
    }
  };

  // Update student attendance
  const updateStudentAttendance = async (enrollmentId, attendance) => {
    try {
      await updateStudentEnrollment(enrollmentId, { attendance });
    } catch (err) {
      console.error('Error updating student attendance:', err);
      throw err;
    }
  };

  // Get class statistics
  const getClassStats = useCallback(() => {
    if (!classStudents.length) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        averageAttendance: 0,
        totalRevenue: 0
      };
    }

    const activeStudents = classStudents.filter(s => s.status === 'active');
    const totalProgress = classStudents.reduce((sum, s) => sum + (s.progress || 0), 0);
    const totalAttendance = classStudents.reduce((sum, s) => sum + (s.attendance || 0), 0);
    const totalRevenue = classStudents.reduce((sum, s) => sum + (s.amount || 0), 0);

    return {
      totalStudents: classStudents.length,
      activeStudents: activeStudents.length,
      averageProgress: Math.round(totalProgress / classStudents.length),
      averageAttendance: Math.round(totalAttendance / classStudents.length),
      totalRevenue
    };
  }, [classStudents]);

  // Search and filter students
  const searchStudents = useCallback((searchTerm, filters = {}) => {
    let filtered = classStudents;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    if (filters.minProgress !== undefined) {
      filtered = filtered.filter(student => (student.progress || 0) >= filters.minProgress);
    }

    if (filters.minAttendance !== undefined) {
      filtered = filtered.filter(student => (student.attendance || 0) >= filters.minAttendance);
    }

    return filtered;
  }, [classStudents]);

  return {
    classStudents,
    loading,
    error,
    enrollStudent,
    updateStudentEnrollment,
    removeStudentFromClass,
    updateStudentProgress,
    updateStudentAttendance,
    getClassStats,
    searchStudents,
    refetch: fetchClassStudents
  };
}; 