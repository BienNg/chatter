import { useState, useEffect, useCallback } from 'react';
import { 
    doc, 
    onSnapshot, 
    updateDoc, 
    serverTimestamp,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * useUnreadMessages - Efficient hook for managing unread message indicators
 * Uses lastReadTimestamps stored in user document to minimize Firebase reads
 */
export const useUnreadMessages = () => {
    const [unreadCounts, setUnreadCounts] = useState({});
    const [lastReadTimestamps, setLastReadTimestamps] = useState({});
    const [loading, setLoading] = useState(true);
    
    const { currentUser } = useAuth();

    // Listen to user's lastReadTimestamps
    useEffect(() => {
        if (!currentUser?.uid) {
            setUnreadCounts({});
            setLastReadTimestamps({});
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            const userData = doc.data();
            const timestamps = userData?.lastReadTimestamps || {};
            setLastReadTimestamps(timestamps);
            setLoading(false);
        }, (error) => {
            console.error('Error listening to user lastReadTimestamps:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser?.uid]);

    // Calculate unread counts efficiently
    const calculateUnreadCounts = useCallback(async (channels) => {
        if (!channels.length || !currentUser?.uid) {
            setUnreadCounts({});
            return;
        }

        try {
            const counts = {};
            
            // Process channels in batches to avoid overwhelming Firestore
            const batchSize = 5;
            for (let i = 0; i < channels.length; i += batchSize) {
                const batch = channels.slice(i, i + batchSize);
                
                await Promise.all(
                    batch.map(async (channel) => {
                        const lastRead = lastReadTimestamps[channel.id];
                        
                        if (!lastRead) {
                            // If no lastRead timestamp, check if channel has any messages from others
                            const messagesQuery = query(
                                collection(db, 'channels', channel.id, 'messages'),
                                orderBy('createdAt', 'desc'),
                                limit(20) // Check last 20 messages
                            );
                            
                            const snapshot = await getDocs(messagesQuery);
                            // Filter out messages from current user (client-side filtering)
                            const unreadMessages = snapshot.docs.filter(doc => 
                                doc.data().authorId !== currentUser.uid
                            );
                            counts[channel.id] = unreadMessages.length > 0 ? unreadMessages.length : 0;
                        } else {
                            // Check for messages after lastRead timestamp
                            const messagesQuery = query(
                                collection(db, 'channels', channel.id, 'messages'),
                                where('createdAt', '>', lastRead),
                                orderBy('createdAt', 'desc'),
                                limit(50) // Reasonable limit to avoid large queries
                            );
                            
                            const snapshot = await getDocs(messagesQuery);
                            // Filter out messages from current user (client-side filtering)
                            const unreadMessages = snapshot.docs.filter(doc => 
                                doc.data().authorId !== currentUser.uid
                            );
                            counts[channel.id] = unreadMessages.length;
                        }
                    })
                );
                
                // Small delay between batches to be respectful to Firebase
                if (i + batchSize < channels.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            setUnreadCounts(counts);
        } catch (error) {
            console.error('Error calculating unread counts:', error);
            // Set empty counts on error to prevent infinite error loops
            setUnreadCounts({});
        }
    }, [lastReadTimestamps, currentUser?.uid]);

    // Mark channel as read
    const markChannelAsRead = useCallback(async (channelId) => {
        if (!currentUser?.uid || !channelId) return;

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            
            await updateDoc(userDocRef, {
                [`lastReadTimestamps.${channelId}`]: serverTimestamp()
            });

            // Immediately update local state to provide instant feedback
            setUnreadCounts(prev => ({
                ...prev,
                [channelId]: 0
            }));

        } catch (error) {
            console.error('Error marking channel as read:', error);
        }
    }, [currentUser?.uid]);

    // Get unread count for a specific channel
    const getUnreadCount = useCallback((channelId) => {
        return unreadCounts[channelId] || 0;
    }, [unreadCounts]);

    // Check if channel has unread messages
    const hasUnreadMessages = useCallback((channelId) => {
        return getUnreadCount(channelId) > 0;
    }, [getUnreadCount]);

    // Initialize lastRead timestamp for new channel
    const initializeChannelRead = useCallback(async (channelId) => {
        if (!currentUser?.uid || !channelId) return;

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            
            await updateDoc(userDocRef, {
                [`lastReadTimestamps.${channelId}`]: serverTimestamp()
            });
        } catch (error) {
            console.error('Error initializing channel read timestamp:', error);
        }
    }, [currentUser?.uid]);

    return {
        unreadCounts,
        lastReadTimestamps,
        loading,
        calculateUnreadCounts,
        markChannelAsRead,
        getUnreadCount,
        hasUnreadMessages,
        initializeChannelRead
    };
}; 