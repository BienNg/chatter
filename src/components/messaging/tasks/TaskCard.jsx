import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';

const TaskCard = ({ task, isSelected, onSelect }) => {
    const { sourceMessageData, status, lastActivity, createdAt } = task;

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

    return (
        <div
            onClick={onSelect}
            className={`relative group bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                isSelected
                    ? 'border-indigo-200 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
        >
            <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                    {sourceMessageData.sender?.displayName?.charAt(0) || 
                     sourceMessageData.sender?.email?.charAt(0) || 'U'}
                </div>
                <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                                {sourceMessageData.sender?.displayName || 'Unknown User'}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimestamp(createdAt)}
                            </span>
                        </div>
                        {status && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                status === 'active' ? 'bg-green-100 text-green-800' :
                                status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {status}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-gray-800 text-left line-clamp-2">
                        {sourceMessageData.content}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        {sourceMessageData.replyCount > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {sourceMessageData.replyCount} {sourceMessageData.replyCount === 1 ? 'reply' : 'replies'}
                            </div>
                        )}
                        {lastActivity && (
                            <div className="text-xs text-gray-400">
                                Last activity: {formatTimestamp(lastActivity)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard; 