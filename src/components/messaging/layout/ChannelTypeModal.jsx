import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Edit, 
  Phone, 
  Calendar,
  MapPin,
  Target,
  DollarSign,
  Clock,
  User,
  ChevronRight,
  Zap,
  Brain,
  CheckSquare,
  AlertCircle,
  Star,
  TrendingUp,
  MessageSquare,
  FileText,
  Send,
  Timer,
  Users,
  Mail,
  CreditCard,
  BookOpen,
  Award,
  Eye,
  MoreHorizontal,
  Info
} from 'lucide-react';
import { Timeline } from '../../shared/checklist';
import { CustomDragLayer } from '../../shared/checklist/CustomDragLayer';

/**
 * ChannelTypeModal - Modal for managing channel type settings and checklists
 */
export const ChannelTypeModal = ({ isOpen, onClose, channelType, metadata }) => {
  const [activeTab, setActiveTab] = useState('checklists');

  // Mock checklist data - exact replica from ImportTab.jsx
  const [workflowStages, setWorkflowStages] = useState([
    {
      id: 'discover',
      title: 'Discovery & First Contact',
      description: 'Build rapport and understand student goals',
      color: 'bg-blue-500',
      icon: Users,
      progress: 100,
      estimatedTime: '15 min',
      tasks: [
        { id: 'initial-contact', title: 'Initial Contact', completed: true, automated: false },
        { id: 'needs-assessment', title: 'Needs Assessment', completed: true, automated: false }
      ]
    },
    {
      id: 'assess',
      title: 'Skill Assessment & Placement',
      description: 'Evaluate current level and learning objectives',
      color: 'bg-indigo-500',
      icon: Brain,
      progress: 75,
      estimatedTime: '30 min',
      tasks: [
        { id: 'placement-test', title: 'Placement Test', completed: true, automated: true },
        { id: 'level-assessment', title: 'Level Assessment', completed: true, automated: false },
        { id: 'learning-goals', title: 'Learning Goals Discussion', completed: false, automated: false }
      ]
    },
    {
      id: 'recommend',
      title: 'Course Recommendation & Planning',
      description: 'Suggest optimal learning path and schedule',
      color: 'bg-purple-500',
      icon: Target,
      progress: 25,
      estimatedTime: '20 min',
      tasks: [
        { id: 'course-recommendation', title: 'Course Recommendation', completed: false, automated: true },
        { id: 'schedule-planning', title: 'Schedule Planning', completed: false, automated: false },
        { id: 'material-selection', title: 'Material Selection', completed: false, automated: true }
      ]
    },
    {
      id: 'enroll',
      title: 'Enrollment & Payment',
      description: 'Complete registration and payment setup',
      color: 'bg-green-500',
      icon: CreditCard,
      progress: 0,
      estimatedTime: '25 min',
      tasks: [
        { id: 'registration-form', title: 'Registration Form', completed: false, automated: false },
        { id: 'payment-setup', title: 'Payment Setup', completed: false, automated: true },
        { id: 'enrollment-confirmation', title: 'Enrollment Confirmation', completed: false, automated: true }
      ]
    },
    {
      id: 'onboard',
      title: 'Welcome & Onboarding',
      description: 'Introduce student to learning environment',
      color: 'bg-emerald-500',
      icon: Star,
      progress: 0,
      estimatedTime: '15 min',
      tasks: [
        { id: 'welcome-package', title: 'Welcome Package', completed: false, automated: true },
        { id: 'platform-tour', title: 'Platform Tour', completed: false, automated: false },
        { id: 'first-session-booking', title: 'First Session Booking', completed: false, automated: false }
      ]
    }
  ]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'info', label: 'Info', icon: Info }
  ];

  const handleTaskStatusChange = (taskId, completed) => {
    // Update the workflow stages when a task's status changes
    const updatedStages = workflowStages.map(stage => {
      // Find the task within the stage
      const taskIndex = stage.tasks.findIndex(task => task.id === taskId);
      
      // If task is found in this stage, update it
      if (taskIndex !== -1) {
        const updatedTasks = [...stage.tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed };
        
        // Calculate new progress based on completed tasks
        const totalTasks = updatedTasks.length;
        const completedCount = updatedTasks.filter(task => task.completed).length;
        const newProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        
        return {
          ...stage,
          tasks: updatedTasks,
          progress: newProgress
        };
      }
      
      return stage;
    });
    
    setWorkflowStages(updatedStages);
  };

  const handleTaskStart = (taskId) => {
    console.log(`Starting task: ${taskId}`);
    // Implement task start functionality here
  };

  const handleAddTask = (stageId, position) => {
    // Create a new task with a unique ID
    const newTaskId = `new-task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: "New Task",
      completed: false,
      automated: false
    };

    // Update the workflow stages to include the new task
    const updatedStages = workflowStages.map(stage => {
      if (stage.id === stageId) {
        // Create a new tasks array with the new task inserted at the specified position
        const updatedTasks = [...stage.tasks];
        updatedTasks.splice(position, 0, newTask);
        
        // Recalculate progress
        const totalTasks = updatedTasks.length;
        const completedCount = updatedTasks.filter(task => task.completed).length;
        const newProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        
        return {
          ...stage,
          tasks: updatedTasks,
          progress: newProgress
        };
      }
      return stage;
    });
    
    setWorkflowStages(updatedStages);
  };

  const handleReorderTasks = (stageId, dragIndex, hoverIndex) => {
    setWorkflowStages(prevStages => 
      prevStages.map(stage => {
        if (stage.id === stageId) {
          const updatedTasks = [...stage.tasks];
          const draggedTask = updatedTasks[dragIndex];
          
          // Remove the dragged task from its position
          updatedTasks.splice(dragIndex, 1);
          // Insert the dragged task at the new position
          updatedTasks.splice(hoverIndex, 0, draggedTask);
          
          return {
            ...stage,
            tasks: updatedTasks
          };
        }
        return stage;
      })
    );
  };
  
  const handleStageTitleChange = (stageId, newTitle) => {
    setWorkflowStages(prevStages => 
      prevStages.map(stage => 
        stage.id === stageId ? { ...stage, title: newTitle } : stage
      )
    );
  };
  
  const handleTaskTitleChange = (stageId, taskId, newTitle) => {
    setWorkflowStages(prevStages => 
      prevStages.map(stage => {
        if (stage.id === stageId) {
          return {
            ...stage,
            tasks: stage.tasks.map(task => 
              task.id === taskId ? { ...task, title: newTitle } : task
            )
          };
        }
        return stage;
      })
    );
  };

  const renderChecklistsTab = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <Timeline 
          stages={workflowStages}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskStart={handleTaskStart}
          onAddTask={handleAddTask}
          onReorderTasks={handleReorderTasks}
          onTitleChange={handleStageTitleChange}
          onTaskTitleChange={handleTaskTitleChange}
        />
      </div>
    </div>
  );

  const renderInfoTab = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Channel Type Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {metadata?.icon && <metadata.icon className="w-8 h-8 text-indigo-600" />}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{metadata?.name || 'Channel Type'}</h3>
              <p className="text-sm text-gray-600">{metadata?.description || 'Channel description'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Channels</div>
              <div className="text-2xl font-bold text-gray-900">--</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Active Workflows</div>
              <div className="text-2xl font-bold text-gray-900">--</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Default Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Auto-create checklist</div>
                <div className="text-sm text-gray-500">Automatically create checklist when new channel is created</div>
              </div>
              <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Sync with template</div>
                <div className="text-sm text-gray-500">Keep channel checklists synchronized with template changes</div>
              </div>
              <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Require completion</div>
                <div className="text-sm text-gray-500">Require all mandatory tasks to be completed</div>
              </div>
              <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {metadata?.icon && <metadata.icon className="w-6 h-6 text-indigo-600" />}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{metadata?.label || 'Channel Type Management'}</h2>
              <p className="text-sm text-gray-600">Manage templates and settings for {channelType} channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <DndProvider backend={HTML5Backend}>
          {activeTab === 'checklists' && renderChecklistsTab()}
          {activeTab === 'info' && renderInfoTab()}
          <CustomDragLayer />
        </DndProvider>
      </div>
    </div>
  );
}; 