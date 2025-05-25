// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot,
    addDoc,
    serverTimestamp,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const useMessages = (channelId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { currentUser, userProfile } = useAuth();

    useEffect(() => {
        if (!channelId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // Query messages in channel, ordered by timestamp
        const messagesQuery = query(
            collection(db, 'channels', channelId, 'messages'),
            orderBy('createdAt', 'asc'),
            limit(100) // Limit for performance
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const messageData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(messageData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching messages:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [channelId]);

    const sendMessage = async (content, attachments = []) => {
        if (!channelId || !currentUser || !content?.trim()) return;

        try {
            const messageData = {
                content: content.trim(),
                authorId: currentUser.uid,
                author: {
                    id: currentUser.uid,
                    displayName: userProfile?.displayName || userProfile?.fullName || currentUser.displayName,
                    email: currentUser.email,
                    avatar: userProfile?.photo || null
                },
                attachments: attachments || [],
                reactions: [],
                replyCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'channels', channelId, 'messages'), messageData);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    return {
        messages,
        loading,
        error,
        sendMessage
    };
};