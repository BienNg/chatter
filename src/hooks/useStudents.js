import { useEffect, useState, useCallback } from 'react';
import { studentServices } from '../utils/firebase-services';

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
      const studentsData = await studentServices.getStudents();
      setStudents(studentsData);
    } catch (err) {
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
          // Don't set global error state for validation errors
          const validationError = new Error('A student with this email already exists');
          validationError.isValidationError = true;
          throw validationError;
        }
      }

      // Generate sequential student ID
      const studentId = generateNextStudentId(students);

      const newStudent = {
        ...studentData,
        studentId, // Use the generated sequential ID
      };

      const docId = await studentServices.addStudent(newStudent);
      
      // Create the student object for local state
      const studentWithId = {
        ...newStudent,
        id: docId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the new student to local state immediately for better UX
      setStudents(prev => [studentWithId, ...prev]);
      
      return docId;
    } catch (err) {
      // Only set global error state for non-validation errors
      if (!err.isValidationError) {
        setError(err.message || 'Failed to add student');
      }
      throw err;
    }
  };

  const updateStudent = async (studentId, updates) => {
    try {
      setError(null);
      
      await studentServices.updateStudent(studentId, updates);
      
      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, ...updates, updatedAt: new Date() }
          : student
      ));
    } catch (err) {
      setError('Failed to update student');
      throw err;
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      setError(null);
      await studentServices.deleteStudent(studentId);
      
      // Remove from local state
      setStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (err) {
      setError('Failed to delete student');
      throw err;
    }
  };

  // Get student by ID
  const getStudentById = useCallback(async (studentId) => {
    try {
      // First check if student is in local state
      const localStudent = students.find(student => student.id === studentId);
      if (localStudent) {
        return localStudent;
      }

      // If not in local state, fetch from database
      const student = await studentServices.getStudentById(studentId);
      return student;
    } catch (err) {
      console.error('Error getting student by ID:', err);
      throw err;
    }
  }, [students]);

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    refetch: fetchStudents
  };
} 