// src/components/MessageListView.jsx (Updated for real-time)
import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Smile,
    MoreHorizontal,
    Reply,
    Forward,
    Heart,
    ThumbsUp,
    Download,
    FileText,
    Clock
} from 'lucide-react';

const MessageListView = ({ messages, loading, onOpenThread, channelId }) => {
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const messagesEndRef = useRef(null);

    // Add debug log for props
    console.log('MessageListView props:', { messages, loading, onOpenThread, channelId });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleThreadClick = (messageId) => {
        console.log('Thread click handler called with messageId:', messageId);
        onOpenThread?.(messageId);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500">Be the first to send a message in this channel!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className="message-container relative group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-150"
                            onMouseEnter={() => setHoveredMessage(message.id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                                    {message.author?.displayName?.charAt(0) || 
                                     message.author?.email?.charAt(0) || 'U'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900 truncate">
                                            {message.author?.displayName || message.author?.email || 'Unknown User'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {formatTimestamp(message.createdAt)}
                                        </span>
                                        {!message.createdAt && (
                                            <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>

                                    <div className="text-gray-800 text-left break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full">
                                        {message.content}
                                    </div>

                                    {/* File Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {message.attachments.map((attachment, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center max-w-sm">
                                                    <FileText className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                                                        <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                                                    </div>
                                                    <button className="ml-3 text-indigo-600 hover:text-indigo-700 flex-shrink-0">
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reactions */}
                                    {message.reactions && message.reactions.length > 0 && (
                                        <div className="mt-2 flex items-center flex-wrap gap-1">
                                            {message.reactions.map((reaction, idx) => (
                                                <button
                                                    key={idx}
                                                    className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors duration-150"
                                                >
                                                    <span className="mr-1">{reaction.emoji}</span>
                                                    <span className="text-gray-700 font-medium">{reaction.count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Thread Indicator */}
                                    {message.replyCount > 0 && (
                                        <button
                                            onClick={() => handleThreadClick(message.id)}
                                            className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 px-2 py-1 rounded transition-colors duration-150"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1 flex-shrink-0" />
                                            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Hover Actions */}
                            {hoveredMessage === message.id && (
                                <div className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center space-x-1 z-10">
                                    <button
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150"
                                        title="Add reaction"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150"
                                        title="Reply in thread"
                                        onClick={() => {
                                            console.log('Reply button clicked for message:', message.id);
                                            handleThreadClick(message.id);
                                        }}
                                    >
                                        <Reply className="h-4 w-4" />
                                    </button>
                                    <button 
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150" 
                                        title="Forward"
                                    >
                                        <Forward className="h-4 w-4" />
                                    </button>
                                    <button 
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors duration-150" 
                                        title="More actions"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MessageListView;