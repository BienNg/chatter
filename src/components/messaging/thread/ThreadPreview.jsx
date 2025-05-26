import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';

const ThreadPreview = ({ 
    message, 
    onOpenThread, 
    className = "" 
}) => {
    // Extract thread data from message
    const threadData = {
        replyCount: message.replyCount || 0,
        lastReply: message.lastReply || null,
        participants: message.threadParticipants || [],
        lastActivity: message.lastThreadActivity || null
    };

    // Get author initials for avatar
    const getAuthorInitials = (author) => {
        if (!author) return 'U';
        return author.displayName?.charAt(0) || author.email?.charAt(0) || 'U';
    };

    // Get a consistent color based on user email or name
    const getAuthorColor = (author) => {
        if (!author) return 'bg-gray-400';
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'];
        const str = author.displayName || author.email || '';
        const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    if (threadData.replyCount === 0) return null;

    return (
        <div className={`mt-2 ${className}`}>
            <button
                onClick={() => onOpenThread(message.id)}
                className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-150 w-full text-left border border-gray-200 hover:border-indigo-200"
            >
                {/* Thread participants avatars */}
                <div className="flex -space-x-1 flex-shrink-0">
                    {threadData.participants.slice(0, 3).map((participant, index) => (
                        <div
                            key={participant.id || index}
                            className={`w-6 h-6 rounded-full ${getAuthorColor(participant)} flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}
                            title={participant.displayName || participant.email}
                        >
                            {getAuthorInitials(participant)}
                        </div>
                    ))}
                    {threadData.participants.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white">
                            +{threadData.participants.length - 3}
                        </div>
                    )}
                </div>

                {/* Thread info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-indigo-600">
                            {threadData.replyCount} {threadData.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                        {threadData.lastActivity && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTimestamp(threadData.lastActivity)}
                                </span>
                            </>
                        )}
                    </div>
                    
                    {/* Latest reply preview */}
                    {threadData.lastReply && (
                        <div className="text-sm text-gray-600 truncate">
                            <span className="font-medium">
                                {threadData.lastReply.author?.displayName || 'Someone'}:
                            </span>
                            <span className="ml-1">
                                {threadData.lastReply.content}
                            </span>
                        </div>
                    )}
                </div>

                {/* View thread indicator */}
                <div className="text-xs text-gray-400 group-hover:text-indigo-600 transition-colors duration-150 flex-shrink-0">
                    View thread
                </div>
            </button>
        </div>
    );
};

export default ThreadPreview; 