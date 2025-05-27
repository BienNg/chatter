import React, { useState } from 'react';
import { X, Star, Bell, Search, UserPlus, MoreHorizontal } from 'lucide-react';

const MOCK_MEMBERS = [
    { id: 1, name: 'Bien Ng', role: 'Admin', avatar: 'B', color: 'bg-indigo-500', status: 'online', lastSeen: 'Active now' },
    { id: 2, name: 'Sarah Johnson', role: 'Member', avatar: 'S', color: 'bg-pink-500', status: 'offline', lastSeen: '2h ago' },
    { id: 3, name: 'Alex Chen', role: 'Member', avatar: 'A', color: 'bg-green-500', status: 'online', lastSeen: 'Active now' },
    { id: 4, name: 'Michael Park', role: 'Member', avatar: 'M', color: 'bg-purple-500', status: 'idle', lastSeen: '5m ago' }
];

const ChannelAboutModal = ({ isOpen, onClose, channel }) => {
    const [activeTab, setActiveTab] = useState('about');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleCopyChannelId = () => {
        navigator.clipboard.writeText(channel.id);
        // TODO: Show a toast notification
    };

    const filteredMembers = MOCK_MEMBERS.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMembersTab = () => (
        <div className="space-y-4">
            {/* Search and Add Members */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add</span>
                </button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`relative w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white font-medium`}>
                                {member.avatar}
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    member.status === 'online' ? 'bg-green-500' :
                                    member.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        member.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {member.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{member.lastSeen}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTabsTab = () => (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Available Tabs</h3>
                <div className="space-y-2">
                    {['Messages', 'Tasks', 'Wiki'].map((tab) => (
                        <div key={tab} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-sm text-gray-900">{tab}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-xl h-[600px] flex flex-col">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-gray-900">#{channel.name}</h2>
                        <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                            <Star className="h-5 w-5" />
                        </button>
                        <div className="relative">
                            <button className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 rounded-md px-3 py-1 hover:border-gray-300 transition-colors">
                                <Bell className="h-4 w-4" />
                                <span>Get Notifications for @ Mentions</span>
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs - Fixed */}
                <div className="flex-shrink-0 flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'about'
                                ? 'text-indigo-600 border-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'members'
                                ? 'text-indigo-600 border-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Members 4
                    </button>
                    <button
                        onClick={() => setActiveTab('tabs')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'tabs'
                                ? 'text-indigo-600 border-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Tabs
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                {/* Channel Name */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">Channel name</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">Edit</button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <p className="text-sm text-gray-900">#{channel.name}</p>
                                    </div>
                                </div>

                                {/* Topic */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">Topic</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">Edit</button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <p className="text-sm text-gray-500">Add a topic</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">Description</h3>
                                        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">Edit</button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <p className="text-sm text-gray-500">Add a description</p>
                                    </div>
                                </div>

                                {/* Created by */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Created by</h3>
                                    <div className="flex items-center bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                            {channel.createdBy?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-900">Bien Ng</span>
                                            <span className="text-sm text-gray-500 ml-2">on August 16, 2023</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Channel Button */}
                                <button className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors">
                                    Leave channel
                                </button>

                                {/* Channel ID */}
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 flex items-center">
                                        Channel ID: {channel.id}
                                        <button 
                                            onClick={handleCopyChannelId}
                                            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            📋
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'members' && renderMembersTab()}
                        {activeTab === 'tabs' && renderTabsTab()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelAboutModal; 