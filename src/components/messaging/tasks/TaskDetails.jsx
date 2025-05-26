import React, { useState } from 'react';
import TaskSourceMessage from './TaskSourceMessage';
import TaskThread from './TaskThread';
import TaskComposer from './TaskComposer';
import TaskDetailsEmpty from './TaskDetailsEmpty';

const TaskDetails = ({ task, channelId, onTaskUpdate }) => {
    const [messageContent, setMessageContent] = useState('');

    if (!task) {
        return <TaskDetailsEmpty />;
    }

    const handleSendMessage = (content) => {
        if (content.trim()) {
            // TODO: Implement sending message to task thread
            console.log('Sending message to task:', task.id, content);
            
            // Simulate adding a reply to the task
            const newReply = {
                id: `reply-${Date.now()}`,
                author: {
                    displayName: 'Current User',
                    avatar: 'CU',
                    avatarColor: 'bg-indigo-500'
                },
                content: content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            // Update task with new reply (this would be handled by the hook in real implementation)
            const updatedTask = {
                ...task,
                replies: [...task.replies, newReply],
                lastActivity: newReply.timestamp
            };
            
            onTaskUpdate?.(updatedTask);
            setMessageContent('');
        }
    };

    const handleJumpToMessage = () => {
        // TODO: Implement navigation to source message
        console.log('Jumping to message:', task.sourceMessage.id);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Source Message Section */}
            <TaskSourceMessage 
                sourceMessage={task.sourceMessage}
                onJumpToMessage={handleJumpToMessage}
            />

            {/* Thread Conversation */}
            <TaskThread 
                replies={task.replies}
                taskId={task.id}
            />

            {/* Message Composer */}
            <TaskComposer 
                onSendMessage={handleSendMessage}
                placeholder="Add a comment..."
            />
        </div>
    );
};

export default TaskDetails; 