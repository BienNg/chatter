// src/components/MessageListView.jsx (Updated for real-time)
import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Download,
    FileText,
    Clock,
    Pin,
    Edit3,
    CheckSquare
} from 'lucide-react';
import DOMPurify from 'dompurify';
import ThreadPreview from './thread/ThreadPreview';
import MessageHoverActions from './MessageHoverActions';
import MessageReactions from './MessageReactions';
import ReactionDetailsModal from './ReactionDetailsModal';
import DeleteMessageModal from './DeleteMessageModal';
import UndoDeleteToast from './UndoDeleteToast';
import MessageComposition from './composition/MessageComposition';
import { useTasks } from '../../hooks/useTasks';
import { useMessageReactions } from '../../hooks/useMessageReactions';
const MessageListView = ({ 
    messages, 
    loading, 
    onOpenThread, 
    channelId,
    deleteMessage,
    undoDeleteMessage,
    canDeleteMessage,
    isWithinEditWindow,
    deletingMessages,
    editMessage,
    togglePinMessage,
    getPinnedMessages,
    isMessagePinned,
    onJumpToTask
}) => {
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null });
    const [undoToast, setUndoToast] = useState({ isVisible: false, messageId: null, messagePreview: '', deleteType: 'soft' });
    const [editingMessage, setEditingMessage] = useState(null);
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [reactionModal, setReactionModal] = useState({ isOpen: false, messageId: null, reactions: [] });
    const messagesEndRef = useRef(null);
    const previousMessageCountRef = useRef(0);
    
    // Tasks functionality
    const { createTaskFromMessage } = useTasks(channelId);
    
    // Message reactions functionality
    const { 
        getMessageReactions, 
        addReaction, 
        removeReaction, 
        currentUser 
    } = useMessageReactions();

    // Add debug log for props
    console.log('MessageListView props:', { messages, loading, onOpenThread, channelId });

    // Load pinned messages when channel changes
    useEffect(() => {
        if (channelId && getPinnedMessages) {
            getPinnedMessages().then(setPinnedMessages).catch(console.error);
        }
    }, [channelId, getPinnedMessages]);

    // Update pinned messages when messages change (in case of real-time updates)
    useEffect(() => {
        if (channelId && getPinnedMessages) {
            getPinnedMessages().then(setPinnedMessages).catch(console.error);
        }
    }, [messages, channelId, getPinnedMessages]);

    // Auto-scroll to bottom only when new messages are added (not when existing messages are updated)
    useEffect(() => {
        const currentMessageCount = messages.length;
        const previousMessageCount = previousMessageCountRef.current;
        
        // Only scroll if we have more messages than before (new message added)
        if (currentMessageCount > previousMessageCount && currentMessageCount > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update the ref with current count
        previousMessageCountRef.current = currentMessageCount;
    }, [messages]);



    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
                   ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const handleThreadClick = (messageId) => {
        console.log('Thread click handler called with messageId:', messageId);
        onOpenThread?.(messageId);
    };

    const handleViewReactionDetails = (messageId, emoji, users) => {
        const reactions = getMessageReactions(messageId);
        setReactionModal({
            isOpen: true,
            messageId,
            reactions
        });
    };

    const closeReactionModal = () => {
        setReactionModal({ isOpen: false, messageId: null, reactions: [] });
    };

    const handleShareMessage = (messageId) => {
        console.log('Sharing message:', messageId);
        // TODO: Implement share functionality
    };

    const handleBookmarkMessage = (messageId) => {
        console.log('Bookmarking message:', messageId);
        // TODO: Implement bookmark functionality
    };

    const handleEditMessage = (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        // Check if user can edit this message
        if (!isWithinEditWindow(message)) {
            console.error('Message can no longer be edited (15 minute window expired)');
            return;
        }

        setEditingMessage(message);
    };

    const handleEditSave = async (messageData) => {
        if (!editingMessage) return;

        try {
            await editMessage(editingMessage.id, messageData.content);
            setEditingMessage(null);
        } catch (error) {
            console.error('Failed to edit message:', error);
            throw error; // Let the editor component handle the error
        }
    };

    const handleEditCancel = () => {
        setEditingMessage(null);
    };

    const handleDeleteMessage = async (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        // Check if user can delete this message
        const hasPermission = await canDeleteMessage(message);
        if (!hasPermission) {
            console.error('No permission to delete this message');
            return;
        }

        // Show delete confirmation modal
        setDeleteModal({
            isOpen: true,
            message: message
        });
    };

    const handleDeleteConfirm = async (options) => {
        const { message } = deleteModal;
        if (!message) return;

        try {
            const result = await deleteMessage(message.id, options);
            
            // Close modal
            setDeleteModal({ isOpen: false, message: null });
            
            if (result.success && result.canUndo) {
                // Show undo toast for soft deletes
                setUndoToast({
                    isVisible: true,
                    messageId: result.messageId,
                    messagePreview: message.content || '',
                    deleteType: result.deleteType
                });
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            // Keep modal open to show error
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, message: null });
    };

    const handleUndoDelete = async () => {
        try {
            await undoDeleteMessage(undoToast.messageId);
        } catch (error) {
            console.error('Failed to undo delete:', error);
            throw error; // Let the toast component handle the error
        }
    };

    const handleUndoDismiss = () => {
        setUndoToast({ isVisible: false, messageId: null, messagePreview: '', deleteType: 'soft' });
    };

    const handlePinMessage = async (messageId) => {
        try {
            const result = await togglePinMessage(messageId);
            if (result.success) {
                // Update local pinned messages state
                if (result.isPinned) {
                    const message = messages.find(m => m.id === messageId);
                    if (message) {
                        setPinnedMessages(prev => [...prev, message]);
                    }
                } else {
                    setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
                }
            }
        } catch (error) {
            console.error('Failed to toggle pin message:', error);
        }
    };

    const handleReportMessage = (messageId) => {
        console.log('Reporting message:', messageId);
        // TODO: Implement report functionality
    };

    const handlePushToTasks = async (messageId) => {
        try {
            const message = messages.find(m => m.id === messageId);
            if (!message) {
                console.error('Message not found:', messageId);
                return;
            }

            // Check if message is already a task
            if (message.isTask) {
                console.log('Message is already a task');
                return;
            }

            await createTaskFromMessage(messageId, message);
            console.log('Task created successfully from message:', messageId);
        } catch (error) {
            console.error('Failed to create task from message:', error);
        }
    };

    const handleJumpToTask = (taskId) => {
        if (onJumpToTask && taskId) {
            onJumpToTask(taskId);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center py-12">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500">Be the first to send a message in this channel!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => {
                        // Handle deleted messages
                        if (message.deleted) {
                            return (
                                <div
                                    key={message.id}
                                    className="message-container relative group rounded-lg p-2 -m-2 opacity-60"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0 flex items-center justify-center text-white font-medium">
                                            {message.author?.displayName?.charAt(0) || 
                                             message.author?.email?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-500 truncate">
                                                    {message.author?.displayName || message.author?.email || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                    {formatTimestamp(message.createdAt)}
                                                </span>
                                            </div>
                                            <div className="text-gray-500 italic text-sm text-left">
                                                [Message deleted]
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Check if this message is being edited
                        if (editingMessage && editingMessage.id === message.id) {
                            return (
                                <div key={message.id} className="message-container p-2 -m-2">
                                    <MessageComposition
                                        mode="edit"
                                        initialContent={editingMessage.content}
                                        initialAttachments={editingMessage.attachments || []}
                                        onSendMessage={handleEditSave}
                                        onCancel={handleEditCancel}
                                        isLoading={false}
                                        editMessage={editingMessage}
                                        maxLength={4000}
                                        compact={true}
                                    />
                                </div>
                            );
                        }

                        const isPinned = pinnedMessages.some(pm => pm.id === message.id);

                        return (
                            <div
                                key={message.id}
                                className={`message-container relative group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-150 ${
                                    deletingMessages?.has(message.id) ? 'opacity-50 pointer-events-none' : ''
                                } ${isPinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''} ${
                                    message.isTask ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                                }`}
                                onMouseEnter={() => setHoveredMessage(message.id)}
                                onMouseLeave={() => setHoveredMessage(null)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
                                        {message.author?.displayName?.charAt(0) || 
                                         message.author?.email?.charAt(0) || 'U'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 truncate">
                                                {message.author?.displayName || message.author?.email || 'Unknown User'}
                                            </span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {formatTimestamp(message.createdAt)}
                                            </span>
                                            {!message.createdAt && (
                                                <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                            )}
                                            {isPinned && (
                                                <Pin className="h-3 w-3 text-yellow-600 flex-shrink-0" title="Pinned message" />
                                            )}
                                            {message.isTask && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJumpToTask(message.taskId);
                                                    }}
                                                    className="h-3 w-3 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                                    title={`Converted to task - Click to view task`}
                                                >
                                                    <CheckSquare className="h-3 w-3" />
                                                </button>
                                            )}
                                            {message.editedAt && (
                                                <span className="text-xs text-gray-400 flex-shrink-0" title={`Edited ${new Date(message.editedAt.toDate()).toLocaleString()}`}>
                                                    (edited)
                                                </span>
                                            )}
                                        </div>

                                        <div className="message-content text-gray-800 text-left break-words whitespace-pre-wrap overflow-wrap-anywhere max-w-full">
                                            {message.content?.includes('<') && message.content?.includes('>') ? (
                                                <div dangerouslySetInnerHTML={{ 
                                                    __html: DOMPurify.sanitize(message.content, {
                                                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'strike', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a'],
                                                        ALLOWED_ATTR: ['href', 'target', 'rel'],
                                                        ALLOW_DATA_ATTR: false
                                                    })
                                                }} />
                                            ) : (
                                                message.content
                                            )}
                                        </div>

                                        {/* Task Link Indicator */}
                                        {message.isTask && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJumpToTask(message.taskId);
                                                    }}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                                >
                                                    <CheckSquare className="w-3 h-3 mr-1" />
                                                    View Task
                                                </button>
                                            </div>
                                        )}

                                    {/* File Attachments */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {message.attachments.map((attachment, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center max-w-sm">
                                                    <FileText className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                                                        <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                                                    </div>
                                                    <button className="ml-3 text-indigo-600 hover:text-indigo-700 flex-shrink-0">
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Message Reactions */}
                                    <MessageReactions
                                        messageId={message.id}
                                        reactions={getMessageReactions(message.id)}
                                        currentUserId={currentUser.id}
                                        onAddReaction={addReaction}
                                        onRemoveReaction={removeReaction}
                                        onViewReactionDetails={handleViewReactionDetails}
                                    />

                                                                        {/* Thread Preview */}
                                    <ThreadPreview 
                                        message={message}
                                        onOpenThread={handleThreadClick}
                                    />
                                </div>
                            </div>

                            {/* Slack-style Hover Actions */}
                            {hoveredMessage === message.id && !deletingMessages?.has(message.id) && (
                                <MessageHoverActions
                                    messageId={message.id}
                                    messageContent={message.content}
                                    onReplyInThread={handleThreadClick}
                                    onShareMessage={handleShareMessage}
                                    onBookmarkMessage={handleBookmarkMessage}
                                    onEditMessage={handleEditMessage}
                                    onDeleteMessage={handleDeleteMessage}
                                    onPinMessage={handlePinMessage}
                                    onReportMessage={handleReportMessage}
                                    onPushToTasks={handlePushToTasks}
                                    onViewTask={handleJumpToTask}
                                    isTask={message.isTask}
                                    taskId={message.taskId}
                                />
                            )}
                        </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteMessageModal
                message={deleteModal.message}
                isOpen={deleteModal.isOpen}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                canHardDelete={true} // TODO: Check user permissions
                hasReplies={deleteModal.message?.replyCount > 0}
                isPinned={false} // TODO: Check if message is pinned
                isWithinEditWindow={deleteModal.message ? isWithinEditWindow(deleteModal.message) : true}
            />

            {/* Undo Delete Toast */}
            <UndoDeleteToast
                isVisible={undoToast.isVisible}
                onUndo={handleUndoDelete}
                onDismiss={handleUndoDismiss}
                messagePreview={undoToast.messagePreview}
                deleteType={undoToast.deleteType}
            />

            {/* Reaction Details Modal */}
            <ReactionDetailsModal
                isOpen={reactionModal.isOpen}
                onClose={closeReactionModal}
                messageId={reactionModal.messageId}
                reactions={reactionModal.reactions}
            />
        </div>
    );
};

export default MessageListView;