import React, { useState } from 'react';
import { Check } from 'lucide-react';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
// import { useTasks } from '../../../hooks/useTasks'; // TODO: Use when implementing real data

const TaskTab = ({ channelId }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    
    // In the future, this will use the real useTasks hook
    // For now, using demo data
    const { tasks, loading, error } = useDemoTasks();

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
    };

    const handleTaskComplete = (taskId) => {
        // TODO: Implement task completion logic
        console.log('Completing task:', taskId);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="text-lg font-medium">Error loading tasks</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex h-full">
                {/* Left Panel - Messages with Tasks */}
                <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Messages with Tasks</h3>
                    </div>
                    <TaskList 
                        tasks={tasks}
                        selectedTask={selectedTask}
                        onTaskSelect={handleTaskSelect}
                        channelId={channelId}
                    />
                </div>

                {/* Right Panel - Task Details */}
                <div className="w-1/2 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                            {selectedTask && (
                                <button 
                                    onClick={() => handleTaskComplete(selectedTask.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Mark as complete"
                                >
                                    <Check className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <TaskDetails 
                        task={selectedTask}
                        channelId={channelId}
                        onTaskUpdate={handleTaskSelect}
                    />
                </div>
            </div>
        </div>
    );
};

// Demo hook - will be replaced with real useTasks hook
const useDemoTasks = () => {
    const [showDemo] = useState(true);
    
    const demoTasks = showDemo ? [
        {
            id: 'task-1',
            sourceMessage: {
                id: 'msg-1',
                author: {
                    displayName: 'Sarah Johnson',
                    avatar: 'SJ',
                    avatarColor: 'bg-blue-500'
                },
                content: 'Please review the new student assessment guidelines by Friday.',
                timestamp: '10:23 AM'
            },
            participants: ['sarah-johnson', 'alex-chen'],
            replies: [
                {
                    id: 'reply-1',
                    author: {
                        displayName: 'Sarah Johnson',
                        avatar: 'SJ',
                        avatarColor: 'bg-blue-500'
                    },
                    content: "I've started reviewing the guidelines. There are some important updates in section 3.",
                    timestamp: '11:15 AM'
                },
                {
                    id: 'reply-2',
                    author: {
                        displayName: 'Alex Chen',
                        avatar: 'AC',
                        avatarColor: 'bg-green-500'
                    },
                    content: "Thanks for the update. I'll focus on reviewing that section first.",
                    timestamp: '11:30 AM'
                }
            ],
            status: 'active',
            createdAt: '10:23 AM',
            lastActivity: '11:30 AM'
        },
        {
            id: 'task-2',
            sourceMessage: {
                id: 'msg-2',
                author: {
                    displayName: 'Alex Chen',
                    avatar: 'AC',
                    avatarColor: 'bg-green-500'
                },
                content: "I'll prepare the progress reports for next week's parent meetings.",
                timestamp: '11:45 AM'
            },
            participants: ['alex-chen'],
            replies: [],
            status: 'active',
            createdAt: '11:45 AM',
            lastActivity: '11:45 AM'
        }
    ] : [];

    return {
        tasks: demoTasks,
        loading: false,
        error: null
    };
};

export default TaskTab; 