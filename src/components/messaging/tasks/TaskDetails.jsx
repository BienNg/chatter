import React from 'react';
import TaskThread from './TaskThread';
import TaskComposer from './TaskComposer';
import TaskDetailsEmpty from './TaskDetailsEmpty';
import { useTasks } from '../../../hooks/useTasks';
import { useThreadReplies } from '../../../hooks/useThreadReplies';

const TaskDetails = ({ task, channelId, onTaskUpdate, onTaskDelete }) => {
    // Use real useTasks hook for task operations
    const { deleteTask } = useTasks(channelId);
    
    // Use unified threading system - same as message threads
    const { sendReply } = useThreadReplies(channelId, task?.sourceMessageId);

    if (!task) {
        return <TaskDetailsEmpty />;
    }

    const handleSendMessage = async (messageData) => {
        if (!messageData.content.trim()) return;
        
        try {
            // Use the same reply system as message threads
            await sendReply(messageData.content);
            console.log('Reply added to unified thread:', task.sourceMessageId);
        } catch (error) {
            console.error('Failed to add reply to thread:', error);
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
        <div className="h-full flex flex-col min-h-0 overflow-hidden">
            {/* Thread Conversation - Scrollable content area with source message */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <TaskThread 
                    taskId={task.id}
                    sourceMessageId={task.sourceMessageId}
                    channelId={channelId}
                    sourceMessage={task.sourceMessageData}
                    onJumpToMessage={handleJumpToMessage}
                    onDeleteTask={handleDeleteTask}
                />
            </div>

            {/* Message Composer - Fixed height */}
            <div className="flex-shrink-0">
                <TaskComposer 
                    onSendMessage={handleSendMessage}
                    placeholder="Add a comment..."
                    channelId={channelId}
                    threadId={task?.sourceMessageId}
                />
            </div>
        </div>
    );
};

export default TaskDetails; 