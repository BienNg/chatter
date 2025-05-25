// src/components/ThreadView.jsx
import React, { useState } from 'react';
import { ArrowLeft, Users, MessageSquare, X } from 'lucide-react';

const ThreadView = ({ isOpen, onClose }) => {
    const [originalMessage] = useState({
        id: 3,
        user: {
            name: 'Sarah Johnson',
            avatar: 'SJ',
            color: 'bg-blue-500'
        },
        content: 'Here\'s the worksheet for today\'s exercises: Can everyone please complete exercises 1-5 for homework?',
        timestamp: '10:30 AM',
        fullTimestamp: 'Today at 10:30 AM'
    });

    const [threadComments] = useState([
        {
            id: 31,
            user: { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
            content: 'Thanks for sharing! Should we focus on the past perfect section?',
            timestamp: '10:35 AM',
            fullTimestamp: 'Today at 10:35 AM'
        },
        {
            id: 32,
            user: { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' },
            content: 'I have a question about exercise 3. The sentence structure seems different from what we learned last week.',
            timestamp: '10:40 AM',
            fullTimestamp: 'Today at 10:40 AM'
        },
        {
            id: 33,
            user: { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
            content: 'Good question, Mai! Exercise 3 introduces the passive voice with past perfect. We\'ll review this in tomorrow\'s class.',
            timestamp: '10:45 AM',
            fullTimestamp: 'Today at 10:45 AM'
        }
    ]);

    const [participants] = useState([
        { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
        { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
        { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' }
    ]);

    if (!isOpen) return null;

    return (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
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
                        {participants.map(participant => (
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
                    <div className={`w-8 h-8 rounded-full ${originalMessage.user.color} flex-shrink-0 flex items-center justify-center text-white font-medium`}>
                        {originalMessage.user.avatar}
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{originalMessage.user.name}</span>
                            <span className="text-xs text-gray-500">{originalMessage.timestamp}</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed text-left">
                            {originalMessage.content}
                        </div>
                        <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                            Jump to message
                        </button>
                    </div>
                </div>
            </div>

            {/* Thread Comments */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {threadComments.map(comment => (
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
                        <div
                            contentEditable="true"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-h-[32px] text-left"
                            placeholder="Reply to thread..."
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                textAlign: 'left'
                            }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                                <span>Also send to #import-s-hai-duong-minh-thu-</span>
                            </div>
                            <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreadView;