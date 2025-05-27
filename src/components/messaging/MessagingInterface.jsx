// src/components/MessagingInterface.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import ChannelAboutModal from './channel/ChannelAboutModal';
import ChannelToolbar from './ChannelToolbar';

// Helper function to extract tab and content info from URL
const useRouteInfo = () => {
    const location = useLocation();
    const params = useParams();
    
    // Extract route segments
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Determine current tab from URL
    let currentTab = 'messages'; // default
    let contentType = null;
    let contentId = null;
    let subTab = null;
    
    if (pathSegments.length >= 3) {
        const tabSegment = pathSegments[2]; // channels/channelId/[tab]
        
        switch (tabSegment) {
            case 'messages':
                currentTab = 'messages';
                if (pathSegments[3] === 'thread' && pathSegments[4]) {
                    contentType = 'thread';
                    contentId = pathSegments[4];
                }
                break;
            case 'tasks':
                currentTab = 'tasks';
                if (pathSegments[3]) {
                    contentType = 'task';
                    contentId = pathSegments[3];
                }
                break;
            case 'classes':
                currentTab = 'classes';
                if (pathSegments[3]) {
                    subTab = pathSegments[3]; // overview or info
                }
                break;
            case 'wiki':
                currentTab = 'wiki';
                if (pathSegments[3]) {
                    contentType = 'page';
                    contentId = pathSegments[3];
                }
                break;
        }
    }
    
    return {
        currentTab,
        contentType,
        contentId,
        subTab,
        channelId: params.channelId
    };
};

const MessagingInterface = () => {
    const navigate = useNavigate();
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showChannelSettings, setShowChannelSettings] = useState(false);
    const [showChannelAbout, setShowChannelAbout] = useState(false);
    
    const { currentTab, contentType, contentId, subTab, channelId } = useRouteInfo();
    
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
    console.log('Route params:', { channelId, contentId });

    // Set first channel as active if none selected
    useEffect(() => {
        if (channels.length > 0 && !channelId) {
            navigate(`/channels/${channels[0].id}/messages`);
        }
    }, [channels, channelId, navigate]);

    const activeChannel = channels.find((channel) => channel.id === channelId);
    
    // Get thread from URL or persistent thread context
    let activeThread = null;
    if (contentType === 'thread' && contentId) {
        // Thread opened via URL
        activeThread = messages.find((msg) => msg.id === contentId);
    } else if (persistentActiveThread && persistentActiveThread.channelId === channelId) {
        // Thread persisted from context
        activeThread = messages.find((msg) => msg.id === persistentActiveThread.messageId);
    }
    
    // Add debug log for active thread and message structure
    console.log('Active thread details:', {
        contentId,
        activeThread,
        messageStructure: activeThread ? JSON.stringify(activeThread, null, 2) : null
    });

    const handleChannelSelect = (newChannelId) => {
        // Switch channel and restore any persistent thread
        switchChannel(newChannelId);
        navigate(`/channels/${newChannelId}/messages`);
    };

    const handleTabSelect = (tab) => {
        if (!channelId) return;
        
        // Navigate to the selected tab
        switch (tab.toLowerCase()) {
            case 'messages':
                navigate(`/channels/${channelId}/messages`);
                break;
            case 'tasks':
                navigate(`/channels/${channelId}/tasks`);
                break;
            case 'classes':
                navigate(`/channels/${channelId}/classes`);
                break;
            case 'wiki':
                navigate(`/channels/${channelId}/wiki`);
                break;
            default:
                navigate(`/channels/${channelId}/messages`);
        }
    };

    const handleOpenThread = (threadMessageId) => {
        console.log('handleOpenThread called with:', threadMessageId);
        const messageData = messages.find(msg => msg.id === threadMessageId);
        openThread(channelId, threadMessageId, messageData);
        navigate(`/channels/${channelId}/messages/thread/${threadMessageId}`);
    };

    const handleCloseThread = () => {
        console.log('handleCloseThread called');
        closeThread(channelId);
        navigate(`/channels/${channelId}/messages`);
    };

    const handleOpenTask = (taskId) => {
        if (!channelId) return;
        if (taskId) {
            navigate(`/channels/${channelId}/tasks/${taskId}`);
        } else {
            navigate(`/channels/${channelId}/tasks`);
        }
    };

    const handleJumpToMessage = (messageId) => {
        if (!channelId || !messageId) return;
        // Navigate to messages tab and open the thread for the message
        navigate(`/channels/${channelId}/messages/thread/${messageId}`);
    };

    const handleChannelCreated = (newChannelId) => {
        setShowCreateChannel(false);
        navigate(`/channels/${newChannelId}/messages`);
    };

    const handleSendMessage = async (messageData) => {
        try {
            await sendMessage(messageData.content, messageData.attachments);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const tabs = [
        { id: 'messages', label: 'Messages' },
        { id: 'classes', label: 'Classes' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'wiki', label: 'Wiki' }
    ];

    // Sub-tabs for Classes
    const classesSubTabs = [
        { id: 'overview', label: 'Classes' },
        { id: 'info', label: 'Info' }
    ];

    const handleClassesSubTabSelect = (subTabId) => {
        if (!channelId) return;
        navigate(`/channels/${channelId}/classes/${subTabId}`);
    };

    const handleChannelUpdate = () => {
        // Refresh channel data when members are updated
        // This will trigger a re-fetch of channels which includes updated member counts
        if (activeChannel) {
            // Force a refresh of the channels list
            window.location.reload(); // Simple approach - you could implement a more sophisticated refresh
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

    // Show empty state if user has no channels
    if (!channelsLoading && channels.length === 0) {
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

                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                        <MessageSquare className="w-12 h-12 text-indigo-300 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Welcome to Chatter!</h3>
                        <p className="text-indigo-200 text-sm mb-6">
                            Get started by creating your first channel to communicate with your team.
                        </p>
                        <button
                            onClick={() => setShowCreateChannel(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Your First Channel
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">No Channel Selected</h2>
                        <p className="text-gray-500">Create a channel to start messaging with your team.</p>
                    </div>
                </div>

                {/* Create Channel Modal */}
                {showCreateChannel && (
                    <CreateChannel
                        isOpen={showCreateChannel}
                        onClose={() => setShowCreateChannel(false)}
                        onChannelCreated={handleChannelCreated}
                    />
                )}
            </div>
        );
    }

    // Render tab content based on current route
    const renderTabContent = () => {
        switch (currentTab) {
                        case 'messages':
                return (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Channel Toolbar */}
                        <ChannelToolbar 
                            channelId={channelId}
                            onJumpToMessage={handleJumpToMessage}
                            onOpenThread={handleOpenThread}
                        />
                        
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
                                                onJumpToTask={handleOpenTask}
                                            />
                                        </ErrorBoundary>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="flex-shrink-0 bg-white">
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
                    </div>
                );

            case 'tasks':
                return (
                    <TaskTab 
                        channelId={channelId} 
                        selectedTaskId={contentType === 'task' ? contentId : null}
                        onTaskSelect={handleOpenTask}
                        onJumpToMessage={handleJumpToMessage}
                    />
                );

            case 'classes':
                return (
                    <div className="flex-1 flex flex-col">
                        {/* Classes Sub-tabs */}
                        <div className="flex items-center px-6 border-b bg-gray-50">
                            {classesSubTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleClassesSubTabSelect(tab.id)}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        (subTab || 'overview') === tab.id
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Classes Content */}
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-lg font-medium">Classes - {subTab || 'overview'}</p>
                                <p className="text-sm">Coming soon...</p>
                            </div>
                        </div>
                    </div>
                );

            case 'wiki':
                return (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-medium">Wiki</p>
                            {contentType === 'page' && <p className="text-sm">Page: {contentId}</p>}
                            <p className="text-sm">Coming soon...</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <p className="text-lg font-medium">Unknown tab</p>
                            <p className="text-sm">Please select a valid tab</p>
                        </div>
                    </div>
                );
        }
    };

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
                                <button 
                                    onClick={() => setShowChannelAbout(true)}
                                    className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                                >
                                    #{activeChannel.name}
                                </button>
                                <span className="ml-2 text-sm text-gray-500">5 members</span>
                            </div>
                        </div>
                        <div className="flex items-center px-6 border-b">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabSelect(tab.label)}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        currentTab === tab.id
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Tab Content Area */}
                {renderTabContent()}
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

            {showChannelAbout && activeChannel && (
                <ChannelAboutModal
                    isOpen={showChannelAbout}
                    onClose={() => setShowChannelAbout(false)}
                    channel={activeChannel}
                    onUpdate={handleChannelUpdate}
                />
            )}
        </div>
    );
};

export default MessagingInterface;