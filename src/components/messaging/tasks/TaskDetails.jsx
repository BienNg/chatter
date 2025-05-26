import React, { useState } from 'react';
import TaskSourceMessage from './TaskSourceMessage';
import TaskThread from './TaskThread';
import TaskComposer from './TaskComposer';
import TaskDetailsEmpty from './TaskDetailsEmpty';
import { useTasks } from '../../../hooks/useTasks';
import { useThreadReplies } from '../../../hooks/useThreadReplies';

const TaskDetails = ({ task, channelId, onTaskUpdate, onTaskDelete }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Use real useTasks hook for task operations
    const { deleteTask } = useTasks(channelId);
    
    // Use unified threading system - same as message threads
    const { sendReply } = useThreadReplies(channelId, task?.sourceMessageId);

    if (!task) {
        return <TaskDetailsEmpty />;
    }

    const handleSendMessage = async (content) => {
        if (!content.trim() || isLoading) return;
        
        try {
            setIsLoading(true);
            // Use the same reply system as message threads
            await sendReply(content);
            console.log('Reply added to unified thread:', task.sourceMessageId);
        } catch (error) {
            console.error('Failed to add reply to thread:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJumpToMessage = () => {
        // TODO: Implement navigation to source message in Messages tab
        console.log('Jumping to message:', task.sourceMessageId);
        // This would switch to Messages tab and scroll to the source message
    };

    const handleDeleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(task.id);
                console.log('Task deleted successfully');
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Source Message Section */}
            <TaskSourceMessage 
                sourceMessage={task.sourceMessageData}
                onJumpToMessage={handleJumpToMessage}
                onDeleteTask={handleDeleteTask}
            />

            {/* Thread Conversation - Uses unified threading system */}
            <TaskThread 
                taskId={task.id}
                sourceMessageId={task.sourceMessageId}
                channelId={channelId}
            />

            {/* Message Composer - Uses unified threading system */}
            <TaskComposer 
                onSendMessage={handleSendMessage}
                placeholder="Add a comment..."
                isLoading={isLoading}
            />
        </div>
    );
};

export default TaskDetails; 