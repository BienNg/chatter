// src/components/ThreadView.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageSquare, X, Send } from 'lucide-react';

const ThreadView = ({ message, replies, isOpen, onClose, onNewReply }) => {
    // Add debug log for props
    console.log('ThreadView props:', { message, replies, isOpen, onClose });
    
    const [replyText, setReplyText] = useState('');
    const [threadReplies, setThreadReplies] = useState(replies || []);

    // Add effect to log state changes
    useEffect(() => {
        console.log('ThreadView state:', { replyText, threadReplies });
    }, [replyText, threadReplies]);

    const handleSendReply = () => {
        if (replyText.trim()) {
            const newReply = {
                id: Date.now(),
                author: message.author || { displayName: 'Unknown User' },
                content: replyText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullTimestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            };
            
            setThreadReplies((prev) => [...prev, newReply]);
            onNewReply?.(message.id, replyText);
            setReplyText('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    const participants = [
        { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
        { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
        { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' },
        { name: 'Bien Nguyen', avatar: 'BN', color: 'bg-indigo-500' }
    ];

    if (!isOpen || !message) return null;

    // Get author initials for avatar
    const getAuthorInitials = (author) => {
        if (!author) return 'U';
        return author.displayName?.charAt(0) || author.email?.charAt(0) || 'U';
    };

    // Get a consistent color based on user email or name
    const getAuthorColor = (author) => {
        if (!author) return 'bg-gray-400';
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500'];
        const str = author.displayName || author.email || '';
        const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div 
            className={`fixed right-0 top-0 w-96 bg-white border-l border-gray-200 flex flex-col h-screen z-40 min-h-0
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Thread Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 rounded-md transition"
                        >
                            <ArrowLeft className="h-4 w-4 text-gray-600" />
                        </button>
                        <h3 className="font-semibold text-gray-900">Thread</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-md transition"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                {/* Thread Participants */}
                <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <div className="flex -space-x-1">
                        {participants.map((participant) => (
                            <div
                                key={participant.name}
                                className={`w-6 h-6 rounded-full ${participant.color} flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}
                                title={participant.name}
                            >
                                {participant.avatar}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">{participants.length} participants</span>
                </div>
            </div>

            {/* Original Message */}
            <div className="px-4 py-4 border-b border-gray-200 bg-blue-50 flex-shrink-0">
                <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${getAuthorColor(message.author)} flex-shrink-0 flex items-center justify-center text-white font-medium`}>
                        {getAuthorInitials(message.author)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                                {message.author?.displayName || message.author?.email || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {message.timestamp ? new Date(message.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed text-left break-words whitespace-pre-wrap overflow-wrap-anywhere">
                            {message.content}
                        </div>
                        <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            Jump to message
                        </button>
                    </div>
                </div>
            </div>

            {/* Thread Comments */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {threadReplies.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full ${getAuthorColor(comment.author)} flex-shrink-0 flex items-center justify-center text-white text-xs font-medium`}>
                            {getAuthorInitials(comment.author)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                    {comment.author?.displayName || comment.author?.email || 'Unknown User'}
                                </span>
                                <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <div className="text-gray-800 text-sm leading-relaxed text-left break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                {comment.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Thread Reply Input */}
            <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">
                        BN
                    </div>
                    <div className="flex-1 min-w-0">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none break-words"
                            rows={2}
                            placeholder="Reply to thread..."
                            style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap'
                            }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                                <span>Also send to #general</span>
                            </div>
                            <button 
                                onClick={handleSendReply}
                                disabled={!replyText.trim()}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center space-x-1 ${
                                    replyText.trim()
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send className="h-3 w-3" />
                                <span>Send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreadView;