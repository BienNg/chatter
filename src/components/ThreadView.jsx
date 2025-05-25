// src/components/ThreadView.jsx
import React, { useState } from 'react';
import { ArrowLeft, Users, MessageSquare, X, Send } from 'lucide-react';

const ThreadView = ({ message, replies, isOpen, onClose, onNewReply }) => {
    const [replyText, setReplyText] = useState('');
    const [threadReplies, setThreadReplies] = useState(replies || []);

    const handleSendReply = () => {
        if (replyText.trim()) {
            const newReply = {
                id: Date.now(),
                user: { name: 'Bien Nguyen', avatar: 'BN', color: 'bg-indigo-500' },
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

    return (
        <div className="fixed right-0 top-0 w-96 bg-white border-l border-gray-200 flex flex-col h-screen z-40">
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
            <div className="px-4 py-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${message.user.color} flex-shrink-0 flex items-center justify-center text-white font-medium`}>
                        {message.user.avatar}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{message.user.name}</span>
                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed text-left">
                            {message.content}
                        </div>
                        <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            Jump to message
                        </button>
                    </div>
                </div>
            </div>

            {/* Thread Comments */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {threadReplies.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full ${comment.user.color} flex-shrink-0 flex items-center justify-center text-white text-xs font-medium`}>
                            {comment.user.avatar}
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">{comment.user.name}</span>
                                <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <div className="text-gray-800 text-sm leading-relaxed text-left">
                                {comment.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Thread Reply Input */}
            <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">
                        BN
                    </div>
                    <div className="flex-grow">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            rows={2}
                            placeholder="Reply to thread..."
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