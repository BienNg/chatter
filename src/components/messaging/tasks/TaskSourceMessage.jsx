import React from 'react';
import { ExternalLink } from 'lucide-react';

const TaskSourceMessage = ({ sourceMessage, onJumpToMessage }) => {
    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Source Message</h4>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium ${sourceMessage.author.avatarColor}`}>
                        {sourceMessage.author.avatar}
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                                {sourceMessage.author.displayName}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                {sourceMessage.timestamp}
                            </span>
                        </div>
                        <div className="mt-1 text-gray-800 text-left">
                            {sourceMessage.content}
                        </div>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
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
};

export default TaskSourceMessage; 