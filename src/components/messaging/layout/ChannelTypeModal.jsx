import React, { useState } from 'react';
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

/**
 * ChannelTypeModal - Modal for managing channel type settings and checklists
 */
export const ChannelTypeModal = ({ isOpen, onClose, channelType, metadata }) => {
  const [activeTab, setActiveTab] = useState('checklists');

  // Mock checklist data - exact replica from ImportTab.jsx
  const [workflowStages] = useState([
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

  const overallProgress = workflowStages.reduce((acc, stage) => acc + stage.progress, 0) / workflowStages.length;
  const completedTasks = workflowStages.flatMap(s => s.tasks).filter(t => t.completed).length;
  const totalTasks = workflowStages.flatMap(s => s.tasks).length;

  const getStageStatusIcon = (stage) => {
    if (stage.progress === 100) return CheckCircle2;
    if (stage.progress > 0) return Timer;
    return Circle;
  };

  const renderChecklistsTab = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Template Progress</h3>
              <p className="text-sm text-gray-600">Default checklist for {metadata?.label || 'channels'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-gray-500">{completedTasks}/{totalTasks} tasks</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline Workflow Stages */}
        <div className="max-w-4xl mx-auto pb-16">
          <div className="relative min-h-full">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500" style={{ height: 'calc(100% - 2rem)' }}></div>
            
            {workflowStages.map((stage, index) => {
              const StageIcon = stage.icon;
              const StatusIcon = getStageStatusIcon(stage);
              
              return (
                <div key={stage.id} className="relative mb-8">
                  {/* Stage Node */}
                  <div className="absolute left-6 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center"
                       style={{ borderColor: stage.color.replace('bg-', '').replace('blue-500', '#3b82f6').replace('indigo-500', '#6366f1').replace('purple-500', '#a855f7').replace('green-500', '#10b981').replace('emerald-500', '#10b981') }}>
                    <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                  </div>
                  
                  {/* Stage Content */}
                  <div className="ml-16 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center text-white`}>
                          <StageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            {stage.title}
                            <StatusIcon className={`w-4 h-4 ${stage.progress === 100 ? 'text-green-500' : stage.progress > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                          </h3>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      {stage.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            task.completed 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              task.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                            }`}>
                              {task.completed ? <CheckSquare className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                            </div>
                            <span className={`font-medium ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </span>
                            {task.automated && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto
                              </span>
                            )}
                          </div>
                          
                          {!task.completed && (
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                              Start
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
        {activeTab === 'checklists' && renderChecklistsTab()}
        {activeTab === 'info' && renderInfoTab()}
      </div>
    </div>
  );
}; 