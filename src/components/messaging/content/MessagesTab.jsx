import React from 'react';
import { MessageSquare } from 'lucide-react';
import MessageListView from '../MessageListView';
import { MessageComposition } from '../composition';
import { ThreadView } from '../thread';
import ChannelToolbar from '../ChannelToolbar';
import ErrorBoundary from '../ErrorBoundary';
import { useResizableThread } from '../../../hooks/useResizableThread';

/**
 * MessagesTab - Messages tab content component
 * Handles message display, composition, and thread management with resizable thread panel
 */
export const MessagesTab = ({
  channelId,
  messages,
  messagesLoading,
  activeThread,
  onOpenThread,
  onCloseThread,
  onSendMessage,
  onJumpToMessage,
  onOpenTask,
  scrollToMessageId,
  // Message actions
  deleteMessage,
  undoDeleteMessage,
  canDeleteMessage,
  isWithinEditWindow,
  deletingMessages,
  editMessage,
  togglePinMessage,
  getPinnedMessages,
  isMessagePinned,
  // Channel info
  activeChannel
}) => {
  // Resizable thread functionality
  const {
    threadWidth,
    isResizing,
    handleMouseDown
  } = useResizableThread(384, 300, 600);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Channel Toolbar */}
      <ChannelToolbar 
        channelId={channelId}
        onJumpToMessage={onJumpToMessage}
        onOpenThread={onOpenThread}
      />
      
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div 
          className="flex flex-col min-h-0 transition-all duration-300 ease-in-out"
          style={{ 
            width: activeThread ? `calc(100% - ${threadWidth}px)` : '100%'
          }}
        >
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
                  onOpenThread={onOpenThread}
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
                  onJumpToTask={onOpenTask}
                  scrollToMessageId={scrollToMessageId}
                />
              </ErrorBoundary>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 bg-white">
            <ErrorBoundary fallbackMessage="Error in message composition. Please refresh the page.">
              <MessageComposition 
                onSendMessage={onSendMessage} 
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
            onClose={onCloseThread}
            channelId={channelId}
            isOpen={true}
            width={threadWidth}
            onResizeStart={handleMouseDown}
            isResizing={isResizing}
          />
        )}
      </div>
    </div>
  );
}; 