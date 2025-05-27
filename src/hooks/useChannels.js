// src/hooks/useChannels.js
import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

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
                    // Sort channels alphabetically by name
                    const sortedChannels = channelData.sort((a, b) => 
                        a.name.localeCompare(b.name)
                    );
                    setChannels(sortedChannels);
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