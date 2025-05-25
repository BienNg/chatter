// src/hooks/useChannels.js
import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy,
    doc,
    getDoc,
    enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
    }
});

export const useChannels = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser?.uid) {
            setChannels([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // Query channels where user is a member
        const channelsQuery = query(
            collection(db, 'channels'),
            where('members', 'array-contains', currentUser.uid),
            orderBy('createdAt', 'desc') // Changed from updatedAt to createdAt for new channels
        );

        const unsubscribe = onSnapshot(
            channelsQuery,
            {
                next: (snapshot) => {
                    const channelData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setChannels(channelData);
                    setLoading(false);
                    setError(null);
                },
                error: (err) => {
                    console.error('Error fetching channels:', err);
                    setError(err.message);
                    setLoading(false);
                }
            }
        );

        return () => unsubscribe();
    }, [currentUser?.uid]);

    const getChannelById = async (channelId) => {
        try {
            const channelRef = doc(db, 'channels', channelId);
            const channelSnap = await getDoc(channelRef);
            return channelSnap.exists() ? { id: channelSnap.id, ...channelSnap.data() } : null;
        } catch (error) {
            console.error('Error fetching channel:', error);
            return null;
        }
    };

    return {
        channels,
        loading,
        error,
        getChannelById
    };
};