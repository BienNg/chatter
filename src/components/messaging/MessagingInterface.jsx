// src/components/MessagingInterface.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { 
    Plus, 
    Settings, 
    Hash, 
    Users, 
    Search, 
    MessageSquare,
    DollarSign,
    User,
    Smile,
    Paperclip,
    Link2,
    Image,
    Mic,
    Bold,
    Italic
} from 'lucide-react';
import { useChannels } from '../../hooks/useChannels';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../contexts/AuthContext';
import { useThread } from '../../contexts/ThreadContext';
import { MessageListView } from './';
import { ThreadView } from './thread';
import { CreateChannel } from './channel';
import { ChannelSettings } from './channel';
import { MessageComposition } from './composition';
import ErrorBoundary from './ErrorBoundary';
import { TaskTab } from './tasks';

const MessagingInterface = () => {
    const { channelId, messageId } = useParams();
    const navigate = useNavigate();
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showChannelSettings, setShowChannelSettings] = useState(false);
    const [activeTab, setActiveTab] = useState('Messages');
    
    const { channels, loading: channelsLoading, getChannelById } = useChannels();
    const { 
        messages, 
        loading: messagesLoading, 
        sendMessage,
        editMessage,
        deleteMessage,
        undoDeleteMessage,
        canDeleteMessage,
        isWithinEditWindow,
        deletingMessages,
        togglePinMessage,
        getPinnedMessages,
        isMessagePinned
    } = useMessages(channelId);
    const { currentUser, userProfile, logout } = useAuth();
    const { 
        openThread, 
        closeThread, 
        getOpenThread, 
        isThreadOpen, 
        switchChannel,
        activeThread: persistentActiveThread 
    } = useThread();

    // Add debug log for route params
    console.log('Route params:', { channelId, messageId });

    // Set first channel as active if none selected
    useEffect(() => {
        if (channels.length > 0 && !channelId) {
            navigate(`/channels/${channels[0].id}`);
        }
    }, [channels, channelId, navigate]);

    const activeChannel = channels.find((channel) => channel.id === channelId);
    
    // Get thread from URL or persistent thread context
    let activeThread = null;
    if (messageId) {
        // Thread opened via URL
        activeThread = messages.find((msg) => msg.id === messageId);
    } else if (persistentActiveThread && persistentActiveThread.channelId === channelId) {
        // Thread persisted from context
        activeThread = messages.find((msg) => msg.id === persistentActiveThread.messageId);
    }
    
    // Add debug log for active thread and message structure
    console.log('Active thread details:', {
        messageId,
        activeThread,
        messageStructure: activeThread ? JSON.stringify(activeThread, null, 2) : null
    });

    const handleChannelSelect = (newChannelId) => {
        // Switch channel and restore any persistent thread
        switchChannel(newChannelId);
        navigate(`/channels/${newChannelId}`);
    };

    const handleOpenThread = (threadMessageId) => {
        console.log('handleOpenThread called with:', threadMessageId);
        const messageData = messages.find(msg => msg.id === threadMessageId);
        openThread(channelId, threadMessageId, messageData);
        navigate(`/channels/${channelId}/messages/${threadMessageId}`);
    };

    const handleCloseThread = () => {
        console.log('handleCloseThread called');
        closeThread(channelId);
        navigate(`/channels/${channelId}`);
    };

    const handleChannelCreated = (newChannelId) => {
        setShowCreateChannel(false);
        navigate(`/channels/${newChannelId}`);
    };

    const handleSendMessage = async (messageData) => {
        try {
            await sendMessage(messageData.content, messageData.attachments);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const tabs = ['Messages', 'Classes', 'Tasks', 'Wiki'];

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
        <div className="flex h-screen">
            {/* Left Navigation Bar */}
            <div className="w-16 bg-indigo-900 flex flex-col items-center py-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <button className="w-10 h-10 rounded-lg bg-indigo-800 flex items-center justify-center text-white">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center text-indigo-300">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center text-indigo-300">
                        <DollarSign className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-auto flex flex-col items-center space-y-4">
                    <button className="w-10 h-10 rounded-lg hover:bg-indigo-800 flex items-center justify-center text-indigo-300">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                        {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>

            {/* Channels Sidebar */}
            <div className="w-64 bg-indigo-800 text-white flex flex-col">
                {/* Channels Header */}
                <div className="p-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Channels</h1>
                    <button 
                        onClick={() => setShowCreateChannel(true)}
                        className="w-8 h-8 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 mb-4">
                    <div className="flex items-center bg-indigo-700/50 rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-indigo-300 mr-2" />
                        <input
                            type="text"
                            placeholder="Search channels"
                            className="bg-transparent border-none text-sm text-white placeholder-indigo-300 focus:outline-none w-full"
                        />
                    </div>
                </div>

                {/* Channel List */}
                <div className="flex-1 overflow-y-auto px-2">
                    {channels.map((channel) => (
                        <button
                            key={channel.id}
                            onClick={() => handleChannelSelect(channel.id)}
                            className={`flex items-center w-full px-3 py-2 rounded-lg mb-1 ${
                                channel.id === channelId
                                    ? 'bg-indigo-700 text-white'
                                    : 'text-indigo-200 hover:bg-indigo-700/50'
                            }`}
                        >
                            <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{channel.name}</span>
                        </button>
                    ))}
                </div>

                {/* Direct Messages Section */}
                <div className="px-4 py-2">
                    <h2 className="text-sm font-semibold text-indigo-300 mb-2">DIRECT MESSAGES</h2>
                    <div className="space-y-1">
                        <button className="flex items-center w-full px-2 py-1 rounded text-indigo-200 hover:bg-indigo-700/50">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">S</div>
                            <span className="truncate">Sarah Johnson</span>
                        </button>
                        <button className="flex items-center w-full px-2 py-1 rounded text-indigo-200 hover:bg-indigo-700/50">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">A</div>
                            <span className="truncate">Alex Chen</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Channel Header & Tabs */}
                {activeChannel && (
                    <>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div className="flex items-center">
                                <h2 className="text-xl font-semibold text-gray-900">#{activeChannel.name}</h2>
                                <span className="ml-2 text-sm text-gray-500">5 members</span>
                            </div>
                        </div>
                        <div className="flex items-center px-6 border-b">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        activeTab === tab
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Tab Content Area */}
                {activeTab === 'Messages' ? (
                    <div className="flex-1 flex min-h-0 overflow-hidden">
                        <div className={`flex-1 flex flex-col min-h-0 ${activeThread ? 'mr-96' : ''}`}>
                            {/* Message List */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <MessageSquare className="w-12 h-12 mb-4" />
                                        <p className="text-lg font-medium">No messages yet</p>
                                        <p className="text-sm">Be the first to send a message in this channel!</p>
                                    </div>
                                ) : (
                                    <ErrorBoundary fallbackMessage="Error loading messages. Please refresh the page.">
                                        <MessageListView
                                            messages={messages}
                                            loading={messagesLoading}
                                            onOpenThread={handleOpenThread}
                                            channelId={channelId}
                                            deleteMessage={deleteMessage}
                                            undoDeleteMessage={undoDeleteMessage}
                                            canDeleteMessage={canDeleteMessage}
                                            isWithinEditWindow={isWithinEditWindow}
                                            deletingMessages={deletingMessages}
                                            editMessage={editMessage}
                                            togglePinMessage={togglePinMessage}
                                            getPinnedMessages={getPinnedMessages}
                                            isMessagePinned={isMessagePinned}
                                        />
                                    </ErrorBoundary>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="flex-shrink-0 border-t border-gray-200 bg-white">
                                <ErrorBoundary fallbackMessage="Error in message composition. Please refresh the page.">
                                    <MessageComposition 
                                        onSendMessage={handleSendMessage} 
                                        channelId={channelId}
                                        placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Type a message...'}
                                    />
                                </ErrorBoundary>
                            </div>
                        </div>

                        {/* Thread View */}
                        {activeThread && (
                            <ThreadView
                                message={activeThread}
                                onClose={handleCloseThread}
                                channelId={channelId}
                                isOpen={true}
                            />
                        )}
                    </div>
                ) : activeTab === 'Tasks' ? (
                    <TaskTab channelId={channelId} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-medium">{activeTab} tab</p>
                            <p className="text-sm">Coming soon...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateChannel && (
                <CreateChannel
                    isOpen={showCreateChannel}
                    onClose={() => setShowCreateChannel(false)}
                    onChannelCreated={handleChannelCreated}
                />
            )}

            {showChannelSettings && activeChannel && (
                <ChannelSettings
                    isOpen={showChannelSettings}
                    onClose={() => setShowChannelSettings(false)}
                    channel={activeChannel}
                />
            )}
        </div>
    );
};

export default MessagingInterface;