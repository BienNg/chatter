import React from 'react';
import { Clock } from 'lucide-react';

const TaskReply = ({ reply, taskId }) => {
    return (
        <div className="flex items-start group">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium ${reply.author.avatarColor}`}>
                {reply.author.avatar}
            </div>
            <div className="ml-3 flex-1">
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                        {reply.author.displayName}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {reply.timestamp}
                    </span>
                </div>
                <div className="mt-1 text-gray-800 text-left">
                    {reply.content}
                </div>
                {/* Future: Add reply actions like edit, delete, react */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Reply actions will go here */}
                </div>
            </div>
        </div>
    );
};

export default TaskReply; 