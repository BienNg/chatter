// src/components/MessagingInterface.jsx (Updated)
import React, { useState } from 'react';
import { Plus, Settings, Hash, Users, Search, Bell, MoreHorizontal } from 'lucide-react';
import { useChannels } from '../../hooks/useChannels';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../contexts/AuthContext';
import { MessageListView } from './';
import { ThreadView } from './thread';
import { CreateChannel } from './channel';
import { ChannelSettings } from './channel';

const MessagingInterface = () => {
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [activeThread, setActiveThread] = useState(null);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showChannelSettings, setShowChannelSettings] = useState(false);
    
    const { channels, loading: channelsLoading, getChannelById } = useChannels();
    const { messages, loading: messagesLoading, sendMessage } = useMessages(activeChannelId);
    const { currentUser, userProfile, logout } = useAuth();

    // Set first channel as active if none selected
    React.useEffect(() => {
        if (channels.length > 0 && !activeChannelId) {
            setActiveChannelId(channels[0].id);
        }
    }, [channels, activeChannelId]);

    const activeChannel = channels.find((channel) => channel.id === activeChannelId);

    const handleChannelSelect = (channelId) => {
        setActiveChannelId(channelId);
        setActiveThread(null); // Close thread when switching channels
    };

    const handleOpenThread = (messageId) => {
        const message = messages.find((msg) => msg.id === messageId);
        if (message) {
            setActiveThread({
                ...message,
                replies: [] // Will be populated by ThreadView component
            });
        }
    };

    const handleCloseThread = () => {
        setActiveThread(null);
    };

    const handleNewMessage = async (messageData) => {
        try {
            await sendMessage(messageData.content, messageData.attachments);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleChannelCreated = (channelId) => {
        setActiveChannelId(channelId);
    };

    const handleChannelUpdated = async () => {
        // Refresh channel data if needed
        if (activeChannelId) {
            const updatedChannel = await getChannelById(activeChannelId);
            // Channel will be updated via real-time listener
        }
    };

    if (channelsLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your channels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Sidebar - Navigation */}
            <div className="w-16 bg-indigo-900 flex flex-col items-center py-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <div className="flex flex-col items-center gap-4 mb-8">
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-indigo-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                </div>
                <div className="mt-auto flex flex-col items-center gap-4">
                    <button 
                        onClick={() => setShowCreateChannel(true)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-300 hover:bg-indigo-800 transition"
                        title="Create Channel"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={logout}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-300 hover:bg-indigo-800 transition"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                        {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>
            
            {/* Channel Sidebar */}
            <div className="w-64 bg-indigo-800 text-white flex flex-col">
                <div className="p-4 border-b border-indigo-700">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold">Chatter</h2>
                        <button 
                            onClick={() => setShowCreateChannel(true)}
                            className="text-indigo-300 hover:text-white"
                            title="Create Channel"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="p-3">
                    <div className="bg-indigo-700 rounded-md flex items-center p-2">
                        <Search className="w-4 h-4 text-indigo-300 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search channels" 
                            className="bg-transparent border-none text-sm text-white placeholder-indigo-300 focus:outline-none w-full" 
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <div className="px-3 py-2">
                        <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
                            <span className="font-semibold">CHANNELS ({channels.length})</span>
                        </div>
                        
                        <div className="space-y-1">
                            {channels.map((channel) => (
                                <button
                                    key={channel.id}
                                    onClick={() => handleChannelSelect(channel.id)}
                                    className={`flex items-center justify-between py-2 px-2 rounded w-full text-left transition ${
                                        activeChannelId === channel.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-indigo-200 hover:bg-indigo-700'
                                    }`}
                                >
                                    <div className="flex items-center min-w-0">
                                        <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span className="text-sm truncate">{channel.name}</span>
                                    </div>
                                    {channel.unreadCount > 0 && (
                                        <span className="bg-indigo-500 text-xs rounded-full px-1.5 py-0.5 ml-2">
                                            {channel.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {channels.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-indigo-300 text-sm mb-3">No channels yet</p>
                                <button
                                    onClick={() => setShowCreateChannel(true)}
                                    className="text-indigo-200 hover:text-white text-sm underline"
                                >
                                    Create your first channel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white transition-all duration-300 ${activeThread ? 'mr-96' : ''}`}>
                {activeChannel ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <Hash className="w-5 h-5 text-gray-500 mr-2" />
                                <h3 className="font-semibold text-gray-800">{activeChannel.name}</h3>
                                <span className="ml-2 text-sm text-gray-500">
                                    {activeChannel.members?.length || 0} members
                                </span>
                                {activeChannel.description && (
                                    <span className="ml-2 text-sm text-gray-400">
                                        • {activeChannel.description}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Bell className="w-5 h-5" />
                                </button>
                                <button className="text-gray-500 hover:text-gray-700">
                                    <Users className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setShowChannelSettings(true)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Message List */}
                        <MessageListView 
                            messages={messages}
                            loading={messagesLoading}
                            onOpenThread={handleOpenThread}
                            onNewMessage={handleNewMessage}
                            channelId={activeChannelId}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Channel Selected</h3>
                            <p className="text-gray-500 mb-4">Choose a channel from the sidebar to start messaging</p>
                            <button
                                onClick={() => setShowCreateChannel(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Create Channel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Thread Panel */}
            {activeThread && (
                <ThreadView 
                    message={activeThread}
                    replies={activeThread.replies}
                    isOpen={true}
                    onClose={handleCloseThread}
                    channelId={activeChannelId}
                />
            )}

            {/* Modals */}
            <CreateChannel
                isOpen={showCreateChannel}
                onClose={() => setShowCreateChannel(false)}
                onChannelCreated={handleChannelCreated}
            />

            {activeChannel && (
                <ChannelSettings
                    channel={activeChannel}
                    isOpen={showChannelSettings}
                    onClose={() => setShowChannelSettings(false)}
                    onUpdate={handleChannelUpdated}
                />
            )}
        </div>
    );
};

export default MessagingInterface;