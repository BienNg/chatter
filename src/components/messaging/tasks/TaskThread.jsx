import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import TaskReply from './TaskReply';
import { ExternalLink, Trash2, MessageSquare } from 'lucide-react';

const TaskThread = ({ taskId, sourceMessageId, channelId, sourceMessage, onJumpToMessage, onDeleteTask }) => {
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

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
                   ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const SourceMessageComponent = () => (
        <div className="relative">
            {/* Source message indicator */}
            <div className="flex items-center mb-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-600">Source Message</span>
                <button 
                    onClick={onDeleteTask}
                    className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete task"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            {/* Source message content with special styling */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                        {sourceMessage?.sender?.displayName?.charAt(0) || 
                         sourceMessage?.sender?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                                {sourceMessage?.sender?.displayName || 'Unknown User'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                {formatTimestamp(sourceMessage?.timestamp)}
                            </span>
                        </div>
                        <div className="mt-1 text-gray-800 text-left break-words whitespace-pre-wrap overflow-wrap-anywhere">
                            {sourceMessage?.content}
                        </div>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-100">
                    <button 
                        onClick={onJumpToMessage}
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Jump to message
                    </button>
                </div>
            </div>
        </div>
    );

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
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
                {/* Source message at the top of the scrollable area */}
                {sourceMessage && <SourceMessageComponent />}
                
                {/* Replies */}
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
        </div>
    );
};

export default TaskThread; 