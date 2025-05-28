// src/components/MessagingInterface.jsx (Updated)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useChannels } from '../../hooks/useChannels';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../contexts/AuthContext';
import { useThread } from '../../contexts/ThreadContext';

// Layout components
import { AppLayout } from './layout';

// Navigation components and hooks
import { TabNavigation, useRouteInfo, useTabNavigation } from './navigation';

// Content components
import { 
  MessagesTab, 
  ClassesTab, 
  WikiTab, 
  EmptyState, 
  LoadingState 
} from './content';

// Task components
import { TaskTab } from './tasks';

// Modal components
import { CreateChannel } from './channel';
import ChannelAboutModal from './channel/ChannelAboutModal';

/**
 * MessagingInterface - Main messaging application component
 * Orchestrates the overall messaging experience with clean separation of concerns
 */
const MessagingInterface = () => {
  const navigate = useNavigate();
  
  // Modal states
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showChannelAbout, setShowChannelAbout] = useState(false);
  const [scrollToMessageId, setScrollToMessageId] = useState(null);
  
  // Route and navigation
  const { currentTab, contentType, contentId, subTab, channelId } = useRouteInfo();
  
  // Data hooks
  const { channels, loading: channelsLoading } = useChannels();
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
    switchChannel,
    activeThread: persistentActiveThread 
  } = useThread();

  // Navigation logic
  const { getTabsForChannel, handleTabSelect } = useTabNavigation(channelId, channels);

  // Auto-redirect to first channel if none selected
  useEffect(() => {
    if (channels.length > 0 && !channelId) {
      navigate(`/channels/${channels[0].id}/messages`);
    }
  }, [channels, channelId, navigate]);

  // Clear scroll target when channel changes
  useEffect(() => {
    setScrollToMessageId(null);
  }, [channelId]);

  // Clear scroll target after use
  useEffect(() => {
    if (scrollToMessageId) {
      const timer = setTimeout(() => setScrollToMessageId(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [scrollToMessageId]);

  // Derived state
  const activeChannel = channels.find((channel) => channel.id === channelId);
  const tabs = activeChannel ? getTabsForChannel(activeChannel) : [];
  
  // Get active thread from URL or persistent context
  let activeThread = null;
  if (contentType === 'thread' && contentId) {
    activeThread = messages.find((msg) => msg.id === contentId);
  } else if (persistentActiveThread && persistentActiveThread.channelId === channelId) {
    activeThread = messages.find((msg) => msg.id === persistentActiveThread.messageId);
  }

  // Event handlers
  const handleChannelSelectWithNavigation = (newChannelId) => {
    switchChannel(newChannelId);
    const newChannel = channels.find(ch => ch.id === newChannelId);
    const availableTabs = getTabsForChannel(newChannel);
    const isCurrentTabAvailable = availableTabs.some(tab => tab.id === currentTab);
    
    if (!isCurrentTabAvailable) {
      navigate(`/channels/${newChannelId}/messages`);
    } else {
      navigate(`/channels/${newChannelId}/${currentTab}`);
    }
  };

  const handleOpenThread = (threadMessageId) => {
    const messageData = messages.find(msg => msg.id === threadMessageId);
    openThread(channelId, threadMessageId, messageData);
    navigate(`/channels/${channelId}/messages/thread/${threadMessageId}`);
  };

  const handleCloseThread = () => {
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
    navigate(`/channels/${channelId}/messages`);
    setScrollToMessageId(messageId);
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

  const handleClassesSubTabSelect = (subTabId) => {
    if (!channelId) return;
    navigate(`/channels/${channelId}/classes/${subTabId}`);
  };

  const handleChannelUpdate = () => {
    setShowChannelAbout(false);
  };

  const handleChannelClick = () => {
    setShowChannelAbout(true);
  };

  // Render loading state
  if (channelsLoading) {
    return <LoadingState />;
  }

  // Render empty state if no channels
  if (!channelsLoading && channels.length === 0) {
    return (
      <EmptyState
        userProfile={userProfile}
        currentUser={currentUser}
        onLogout={logout}
        showCreateChannel={showCreateChannel}
        onShowCreateChannel={() => setShowCreateChannel(true)}
        onHideCreateChannel={() => setShowCreateChannel(false)}
        onChannelCreated={handleChannelCreated}
      />
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'messages':
        return (
          <MessagesTab
            channelId={channelId}
            messages={messages}
            messagesLoading={messagesLoading}
            activeThread={activeThread}
            onOpenThread={handleOpenThread}
            onCloseThread={handleCloseThread}
            onSendMessage={handleSendMessage}
            onJumpToMessage={handleJumpToMessage}
            onOpenTask={handleOpenTask}
            scrollToMessageId={scrollToMessageId}
            deleteMessage={deleteMessage}
            undoDeleteMessage={undoDeleteMessage}
            canDeleteMessage={canDeleteMessage}
            isWithinEditWindow={isWithinEditWindow}
            deletingMessages={deletingMessages}
            editMessage={editMessage}
            togglePinMessage={togglePinMessage}
            getPinnedMessages={getPinnedMessages}
            isMessagePinned={isMessagePinned}
            activeChannel={activeChannel}
          />
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
          <ClassesTab
            channelId={channelId}
            subTab={subTab}
            onSubTabSelect={handleClassesSubTabSelect}
            activeChannel={activeChannel}
          />
        );

      case 'wiki':
        return (
          <WikiTab 
            contentType={contentType}
            contentId={contentId}
          />
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

  // Main render
  return (
    <>
      <AppLayout
        channels={channels}
        activeChannelId={channelId}
        onChannelSelect={handleChannelSelectWithNavigation}
        onCreateChannel={() => setShowCreateChannel(true)}
        userProfile={userProfile}
        currentUser={currentUser}
        onLogout={logout}
      >
        {/* Channel Header & Tab Navigation */}
        {activeChannel && (
          <TabNavigation
            tabs={tabs}
            currentTab={currentTab}
            onTabSelect={handleTabSelect}
            channel={activeChannel}
            onChannelClick={handleChannelClick}
          />
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </AppLayout>

      {/* Modals */}
      {showCreateChannel && (
        <CreateChannel
          isOpen={showCreateChannel}
          onClose={() => setShowCreateChannel(false)}
          onChannelCreated={handleChannelCreated}
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
    </>
  );
};

export default MessagingInterface;