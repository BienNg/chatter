import { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper function to generate next sequential student ID
const generateNextStudentId = (existingStudents) => {
  // Extract all existing student IDs that match the STU format
  const studentNumbers = existingStudents
    .filter(student => student.studentId && student.studentId.startsWith('STU'))
    .map(student => {
      const match = student.studentId.match(/STU(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  // Find the highest number and add 1
  const nextNumber = studentNumbers.length > 0 ? Math.max(...studentNumbers) + 1 : 1;
  
  // Format as STU with 5 digits (padded with zeros)
  return `STU${nextNumber.toString().padStart(5, '0')}`;
};

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure studentId exists for enrollment compatibility
          studentId: data.studentId || doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date()
        };
      });
      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (studentData) => {
    try {
      setError(null);
      
      // Check for duplicate email if provided
      if (studentData.email) {
        const existingStudent = students.find(
          student => student.email.toLowerCase() === studentData.email.toLowerCase()
        );
        if (existingStudent) {
          throw new Error('A student with this email already exists');
        }
      }

      // Generate sequential student ID
      const studentId = generateNextStudentId(students);

      const newStudent = {
        ...studentData,
        studentId, // Use the generated sequential ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'students'), newStudent);
      
      // Create the student object for local state
      const studentWithId = {
        ...newStudent,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the new student to local state immediately for better UX
      setStudents(prev => [studentWithId, ...prev]);
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.message || 'Failed to add student');
      throw err;
    }
  };

  const updateStudent = async (studentId, updates) => {
    try {
      console.log('===== UPDATE STUDENT FUNCTION CALLED =====');
      console.log('Student ID:', studentId);
      console.log('Updates:', updates);
      
      setError(null);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      console.log('Final update data with timestamp:', updateData);
      console.log('Calling Firebase updateDoc...');

      await updateDoc(doc(db, 'students', studentId), updateData);
      
      console.log('Firebase updateDoc successful!');
      console.log('Updating local state...');
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, ...updates, updatedAt: new Date() }
          : student
      ));
      
      console.log('Local state updated successfully');
      console.log('===== UPDATE STUDENT FUNCTION COMPLETED =====');
    } catch (err) {
      console.error('Error updating student:', err);
      console.error('Error details:', err.code, err.message);
      setError('Failed to update student');
      throw err;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'students', studentId));
      
      // Remove from local state
      setStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student');
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents
  };
} 