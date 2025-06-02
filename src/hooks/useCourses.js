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

export const useCourses = (classId = null) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();

    // Fetch courses - either all or for specific class
    const fetchCourses = useCallback(async () => {
        if (!currentUser?.uid) {
            setCourses([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            let q;
            if (classId) {
                // Get courses for specific class
                q = query(
                    collection(db, 'courses'),
                    where('classId', '==', classId),
                    orderBy('createdAt', 'desc')
                );
            } else {
                // Get all courses, ordered by creation date
                q = query(
                    collection(db, 'courses'),
                    orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await getDocs(q);
            const coursesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
            
            setCourses(coursesData);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, classId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Create a new course linked to a class
    const createCourse = async (courseData, classId) => {
        try {
            setError(null);
            
            const timestamp = serverTimestamp();
            const newCourse = {
                classId,
                courseName: courseData.courseName,
                sheetUrl: courseData.sheetUrl || '',
                teachers: courseData.teachers || [],
                level: courseData.level || '',
                beginDate: courseData.beginDate || '',
                endDate: courseData.endDate || '',
                days: courseData.days || [],
                totalDays: courseData.totalDays || '',
                status: 'active',
                createdAt: timestamp,
                updatedAt: timestamp,
                createdBy: currentUser.uid
            };
            
            const docRef = await addDoc(collection(db, 'courses'), newCourse);
            
            // Refresh courses list
            await fetchCourses();
            
            return { id: docRef.id, ...newCourse };
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.message);
            throw err;
        }
    };

    // Update an existing course
    const updateCourse = async (courseId, updates) => {
        try {
            setError(null);
            
            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            
            // Refresh courses list
            await fetchCourses();
        } catch (err) {
            console.error('Error updating course:', err);
            setError('Failed to update course');
            throw err;
        }
    };

    // Delete a course
    const deleteCourse = async (courseId) => {
        try {
            setError(null);
            
            await deleteDoc(doc(db, 'courses', courseId));
            
            // Refresh courses list
            await fetchCourses();
        } catch (err) {
            console.error('Error deleting course:', err);
            setError('Failed to delete course');
            throw err;
        }
    };

    // Archive a course
    const archiveCourse = async (courseId) => {
        try {
            setError(null);
            
            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                status: 'archived',
                updatedAt: serverTimestamp()
            });
            
            // Refresh courses list
            await fetchCourses();
        } catch (err) {
            console.error('Error archiving course:', err);
            setError('Failed to archive course');
            throw err;
        }
    };

    // Get courses by class ID
    const getCoursesByClassId = useCallback(async (classId) => {
        try {
            const coursesQuery = query(
                collection(db, 'courses'),
                where('classId', '==', classId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(coursesQuery);
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
        } catch (err) {
            console.error('Error getting courses by class ID:', err);
            return [];
        }
    }, []);

    // Query courses by various filters
    const queryCourses = async (filters = {}) => {
        try {
            let q = collection(db, 'courses');
            
            // Apply filters
            if (filters.teacher) {
                q = query(q, where('teachers', 'array-contains', filters.teacher));
            }
            if (filters.level) {
                q = query(q, where('level', '==', filters.level));
            }
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }
            if (filters.classId) {
                q = query(q, where('classId', '==', filters.classId));
            }
            
            // Always order by creation date
            q = query(q, orderBy('createdAt', 'desc'));
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
        } catch (err) {
            console.error('Error querying courses:', err);
            throw err;
        }
    };

    return {
        courses,
        loading,
        error,
        createCourse,
        updateCourse,
        deleteCourse,
        archiveCourse,
        getCoursesByClassId,
        queryCourses,
        refetch: fetchCourses
    };
}; 