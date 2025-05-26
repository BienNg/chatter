import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import TaskReply from './TaskReply';

const TaskThread = ({ taskId, sourceMessageId, channelId }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const previousReplyCountRef = useRef(0);
    const hasInitiallyScrolledRef = useRef(false);

    // Real-time listener for message replies (unified threading system)
    useEffect(() => {
        if (!channelId || !sourceMessageId) {
            setReplies([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // Listen to replies on the source message
        const repliesRef = collection(db, 'channels', channelId, 'messages', sourceMessageId, 'replies');
        const repliesQuery = query(repliesRef, orderBy('createdAt', 'asc'));
        
        const unsubscribe = onSnapshot(repliesQuery, 
            (snapshot) => {
                const repliesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setReplies(repliesData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching task thread replies:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [channelId, sourceMessageId]);

    // Auto-scroll to bottom when new replies are added or on initial load
    useEffect(() => {
        const currentReplyCount = replies.length;
        const previousReplyCount = previousReplyCountRef.current;
        
        // Scroll to bottom if:
        // 1. New replies were added (currentReplyCount > previousReplyCount)
        // 2. Initial load with existing replies (!hasInitiallyScrolledRef.current && currentReplyCount > 0)
        if ((currentReplyCount > previousReplyCount && currentReplyCount > 0) || 
            (!hasInitiallyScrolledRef.current && currentReplyCount > 0 && !loading)) {
            
            // Use a small timeout to ensure DOM is updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            hasInitiallyScrolledRef.current = true;
        }
        
        // Update the ref with current count
        previousReplyCountRef.current = currentReplyCount;
    }, [replies, loading]);

    // Reset scroll tracking when switching tasks
    useEffect(() => {
        hasInitiallyScrolledRef.current = false;
        previousReplyCountRef.current = 0;
    }, [sourceMessageId]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {replies.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No comments yet. Start the conversation!</p>
                </div>
            ) : (
                replies.map((reply) => (
                    <TaskReply 
                        key={reply.id} 
                        reply={reply} 
                        taskId={taskId}
                    />
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default TaskThread; 