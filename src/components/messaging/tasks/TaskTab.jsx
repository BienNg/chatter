import React, { useState, useEffect } from 'react';
import { Check, Clock, CheckCheck, AlertCircle } from 'lucide-react';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import { useTasks } from '../../../hooks/useTasks';

const TaskTab = ({ channelId, selectedTaskId, onTaskSelect }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    
    // Use real useTasks hook
    const { 
        tasks, 
        loading, 
        error, 
        markTaskComplete, 
        deleteTask 
    } = useTasks(channelId);

    // Update selected task when selectedTaskId prop changes
    useEffect(() => {
        if (selectedTaskId && tasks.length > 0) {
            const task = tasks.find(t => t.id === selectedTaskId);
            setSelectedTask(task || null);
        } else {
            setSelectedTask(null);
        }
    }, [selectedTaskId, tasks]);

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
        // Notify parent component to update URL
        if (onTaskSelect && task) {
            onTaskSelect(task.id);
        }
    };

    const handleTaskComplete = async (taskId) => {
        try {
            await markTaskComplete(taskId);
            // If the completed task was selected, clear selection
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
                // Navigate back to tasks list
                if (onTaskSelect) {
                    onTaskSelect(null);
                }
            }
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await deleteTask(taskId);
            // If the deleted task was selected, clear selection
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
                // Navigate back to tasks list
                if (onTaskSelect) {
                    onTaskSelect(null);
                }
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0">
                {/* Left Panel - Messages with Tasks */}
                <div className="w-1/2 border-r border-gray-200 flex flex-col min-h-0 max-w-[50vw]">
                    <div className="p-4 border-b border-gray-200 flex-shrink-0">
                        <h3 className="text-lg font-semibold text-gray-900">Messages with Tasks</h3>
                        <p className="text-sm text-gray-500 mt-1">{tasks.length} active tasks</p>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <TaskList 
                            tasks={tasks}
                            selectedTask={selectedTask}
                            onTaskSelect={handleTaskSelect}
                            channelId={channelId}
                        />
                    </div>
                </div>

                {/* Right Panel - Task Details */}
                <div className="w-1/2 flex flex-col min-h-0 max-w-[50vw]">
                    <div className="p-4 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                            {selectedTask && selectedTask.status === 'active' && (
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
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <TaskDetails 
                            task={selectedTask}
                            channelId={channelId}
                            onTaskUpdate={handleTaskSelect}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskTab; 