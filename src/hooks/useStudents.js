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
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
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

      const newStudent = {
        ...studentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'students'), newStudent);
      
      // Add the new student to local state immediately for better UX
      const studentWithId = {
        ...newStudent,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
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
      setError(null);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'students', studentId), updateData);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, ...updates, updatedAt: new Date() }
          : student
      ));
    } catch (err) {
      console.error('Error updating student:', err);
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