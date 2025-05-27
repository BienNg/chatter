import React, { useState, useEffect } from 'react';
import { X, Star, Bell, Search, UserPlus, MoreHorizontal, Loader2 } from 'lucide-react';
import { useChannelManagement } from '../../../hooks/useChannelManagement';
import { useAuth } from '../../../contexts/AuthContext';

const ChannelAboutModal = ({ isOpen, onClose, channel, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('about');
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);

    const { userProfile } = useAuth();
    const {
        loading,
        addMemberToChannel,
        removeMemberFromChannel,
        getAllUsers
    } = useChannelManagement();

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen, channel]);

    if (!isOpen) return null;

    const loadUsers = async () => {
        try {
            const users = await getAllUsers();
            setAllUsers(users);
            
            // Filter users who are already members
            const members = users.filter(user => channel.members?.includes(user.id));
            const available = users.filter(user => !channel.members?.includes(user.id));
            
            setChannelMembers(members);
            setAvailableUsers(available);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleCopyChannelId = () => {
        navigator.clipboard.writeText(channel.id);
        // TODO: Show a toast notification
    };

    const handleAddMember = async (userId) => {
        try {
            await addMemberToChannel(channel.id, userId, channel.name);
            await loadUsers(); // Refresh the user lists
            onUpdate?.(); // Notify parent component to refresh
        } catch (error) {
            console.error('Failed to add member:', error);
            // TODO: Show error toast
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await removeMemberFromChannel(channel.id, userId, channel.name);
            await loadUsers(); // Refresh the user lists
            onUpdate?.(); // Notify parent component to refresh
        } catch (error) {
            console.error('Failed to remove member:', error);
            // TODO: Show error toast
        }
    };

    const handleBulkAddMembers = async () => {
        if (selectedUsersToAdd.length === 0) return;
        
        try {
            // Add members one by one to ensure proper notifications
            for (const userId of selectedUsersToAdd) {
                await addMemberToChannel(channel.id, userId, channel.name);
            }
            
            setSelectedUsersToAdd([]);
            setShowAddMemberModal(false);
            await loadUsers();
            onUpdate?.();
        } catch (error) {
            console.error('Failed to add members:', error);
            // TODO: Show error toast
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsersToAdd(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredMembers = channelMembers.filter(member => 
        member.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAvailableUsers = availableUsers.filter(user =>
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (userId) => {
        // Simple status simulation - in real app, you'd track this in Firebase
        const colors = ['bg-green-500', 'bg-yellow-500', 'bg-gray-400'];
        return colors[userId.length % 3];
    };

    const getLastSeen = (userId) => {
        // Simple last seen simulation - in real app, you'd track this in Firebase
        const options = ['Active now', '5m ago', '1h ago', '2h ago'];
        return options[userId.length % 4];
    };

    const getUserInitials = (user) => {
        if (user.displayName) {
            return user.displayName.charAt(0).toUpperCase();
        }
        return user.email?.charAt(0).toUpperCase() || '?';
    };

    const getUserColor = (userId) => {
        const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-red-500'];
        return colors[userId.length % colors.length];
    };

    const isChannelCreator = (userId) => {
        return channel.createdBy === userId;
    };

    const canManageMembers = () => {
        // Allow everyone to add members - no restrictions
        return true;
    };

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
                {canManageMembers() && (
                    <button 
                        onClick={() => setShowAddMemberModal(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">Add</span>
                    </button>
                )}
            </div>

            {/* Members List */}
            <div className="space-y-2">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`relative w-10 h-10 ${getUserColor(member.id)} rounded-full flex items-center justify-center text-white font-medium`}>
                                {getUserInitials(member)}
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.id)}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {member.displayName || member.email}
                                    </h3>
                                    {isChannelCreator(member.id) && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                            Creator
                                        </span>
                                    )}
                                    {member.roles?.some(role => role.name === 'admin') && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">{getLastSeen(member.id)}</p>
                            </div>
                        </div>
                        {canManageMembers() && !isChannelCreator(member.id) && (
                            <button 
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={loading}
                                className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Members Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Add Members</h3>
                            <button 
                                onClick={() => {
                                    setShowAddMemberModal(false);
                                    setSelectedUsersToAdd([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {filteredAvailableUsers.map((user) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsersToAdd.includes(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                            className="h-4 w-4 text-indigo-600 rounded"
                                        />
                                        <div className={`w-8 h-8 ${getUserColor(user.id)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                                            {getUserInitials(user)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user.displayName || user.email}
                                            </p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => {
                                    setShowAddMemberModal(false);
                                    setSelectedUsersToAdd([]);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkAddMembers}
                                disabled={selectedUsersToAdd.length === 0 || loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    `Add ${selectedUsersToAdd.length} member${selectedUsersToAdd.length !== 1 ? 's' : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                        Members {channelMembers.length}
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