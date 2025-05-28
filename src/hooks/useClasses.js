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

export const useClasses = (channelId = null) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();

    // Fetch classes - either all or for specific channel
    const fetchClasses = useCallback(async () => {
        if (!currentUser?.uid) {
            setClasses([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            let q;
            if (channelId) {
                // Get class for specific channel
                q = query(
                    collection(db, 'classes'),
                    where('channelId', '==', channelId)
                );
            } else {
                // Get all classes, ordered by creation date
                q = query(
                    collection(db, 'classes'),
                    orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await getDocs(q);
            const classesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
            
            setClasses(classesData);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setError('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid, channelId]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Create a new class linked to a channel
    const createClass = async (classData, channelId) => {
        try {
            setError(null);
            
            // Check if channel already has a class
            const existingClassQuery = query(
                collection(db, 'classes'),
                where('channelId', '==', channelId)
            );
            const existingSnapshot = await getDocs(existingClassQuery);
            
            if (!existingSnapshot.empty) {
                throw new Error('This channel already has a class linked to it');
            }
            
            const timestamp = serverTimestamp();
            const newClass = {
                channelId,
                className: classData.className,
                classType: classData.type,
                format: classData.format || 'Online',
                googleDriveUrl: classData.sheetUrl || '',
                teachers: classData.teachers || [],
                level: classData.level || '',
                beginDate: classData.beginDate || '',
                endDate: classData.endDate || '',
                days: classData.days || [],
                status: 'active',
                createdAt: timestamp,
                updatedAt: timestamp,
                createdBy: currentUser.uid
            };
            
            const docRef = await addDoc(collection(db, 'classes'), newClass);
            
            // Refresh classes list
            await fetchClasses();
            
            return { id: docRef.id, ...newClass };
        } catch (err) {
            console.error('Error creating class:', err);
            setError(err.message);
            throw err;
        }
    };

    // Update an existing class
    const updateClass = async (classId, updates) => {
        try {
            setError(null);
            
            const classRef = doc(db, 'classes', classId);
            await updateDoc(classRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            
            // Refresh classes list
            await fetchClasses();
        } catch (err) {
            console.error('Error updating class:', err);
            setError('Failed to update class');
            throw err;
        }
    };

    // Archive a class (when channel type changes away from 'class')
    const archiveClass = async (channelId) => {
        try {
            setError(null);
            
            const classQuery = query(
                collection(db, 'classes'),
                where('channelId', '==', channelId)
            );
            const snapshot = await getDocs(classQuery);
            
            if (!snapshot.empty) {
                const classDoc = snapshot.docs[0];
                await updateDoc(doc(db, 'classes', classDoc.id), {
                    status: 'archived',
                    updatedAt: serverTimestamp()
                });
                
                // Refresh classes list
                await fetchClasses();
            }
        } catch (err) {
            console.error('Error archiving class:', err);
            setError('Failed to archive class');
            throw err;
        }
    };

    // Get class by channel ID
    const getClassByChannelId = useCallback(async (channelId) => {
        console.log('useClasses - getClassByChannelId called with:', channelId);
        
        if (!channelId) {
            console.log('useClasses - No channelId provided');
            return null;
        }
        
        try {
            console.log('useClasses - Querying classes collection for channelId:', channelId);
            
            const classQuery = query(
                collection(db, 'classes'),
                where('channelId', '==', channelId)
            );
            
            console.log('useClasses - Executing query...');
            const snapshot = await getDocs(classQuery);
            
            console.log('useClasses - Query completed. Found', snapshot.docs.length, 'documents');
            
            if (!snapshot.empty) {
                const classDoc = snapshot.docs[0];
                const classData = {
                    id: classDoc.id,
                    ...classDoc.data(),
                    createdAt: classDoc.data().createdAt?.toDate?.() || new Date(),
                    updatedAt: classDoc.data().updatedAt?.toDate?.() || new Date()
                };
                
                console.log('useClasses - Found class:', classData);
                return classData;
            } else {
                console.log('useClasses - No class found for channelId:', channelId);
                
                // Let's also try to list all classes to see what's in the collection
                console.log('useClasses - Listing all classes for debugging...');
                const allClassesQuery = query(collection(db, 'classes'));
                const allSnapshot = await getDocs(allClassesQuery);
                
                console.log('useClasses - Total classes in collection:', allSnapshot.docs.length);
                allSnapshot.docs.forEach((doc, index) => {
                    const data = doc.data();
                    console.log(`useClasses - Class ${index + 1}:`, {
                        id: doc.id,
                        channelId: data.channelId,
                        className: data.className
                    });
                });
                
                return null;
            }
        } catch (err) {
            console.error('useClasses - Error getting class by channel ID:', err);
            console.error('useClasses - Error details:', {
                code: err.code,
                message: err.message,
                stack: err.stack
            });
            return null;
        }
    }, []);

    // Query classes by various filters
    const queryClasses = async (filters = {}) => {
        try {
            let q = collection(db, 'classes');
            
            // Apply filters
            if (filters.teacher) {
                q = query(q, where('teachers', 'array-contains', filters.teacher));
            }
            if (filters.level) {
                q = query(q, where('level', '==', filters.level));
            }
            if (filters.classType) {
                q = query(q, where('classType', '==', filters.classType));
            }
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
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
            console.error('Error querying classes:', err);
            throw err;
        }
    };

    return {
        classes,
        loading,
        error,
        createClass,
        updateClass,
        archiveClass,
        getClassByChannelId,
        queryClasses,
        refetch: fetchClasses
    };
}; 