import React from 'react';
import TaskReply from './TaskReply';

const TaskThread = ({ replies, taskId }) => {
    if (!replies || replies.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="text-gray-500">
                    <p className="text-sm">No replies yet</p>
                    <p className="text-xs mt-1">Start the conversation by adding a comment below.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
                {replies.map((reply) => (
                    <TaskReply 
                        key={reply.id} 
                        reply={reply}
                        taskId={taskId}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskThread; 