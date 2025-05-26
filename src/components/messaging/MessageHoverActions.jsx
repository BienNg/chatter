import React, { useState, useEffect } from 'react';
import {
    Smile,
    MoreHorizontal,
    Reply,
    Share,
    Bookmark,
    Copy,
    Edit3,
    Trash2,
    Pin,
    AlertTriangle,
    CheckSquare
} from 'lucide-react';
import './MessageHoverActions.css';

const MessageHoverActions = ({ 
    messageId, 
    messageContent,
    onReplyInThread,
    onAddReaction,
    onShareMessage,
    onBookmarkMessage,
    onEditMessage,
    onDeleteMessage,
    onPinMessage,
    onReportMessage,
    onPushToTasks,
    isTask = false,
    className = ""
}) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.reaction-picker') && !event.target.closest('.more-actions-menu')) {
                setShowReactionPicker(false);
                setShowMoreActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddReaction = (emoji) => {
        onAddReaction?.(messageId, emoji);
        setShowReactionPicker(false);
    };

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(messageContent);
        console.log('Copied message to clipboard');
        setShowMoreActions(false);
    };

    // Common reaction emojis like Slack
    const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

    return (
        <div className={`message-hover-actions ${className}`}>
            {/* Add Reaction */}
            <div className="relative">
                <button
                    title="Add reaction"
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                >
                    <Smile className="h-4 w-4" />
                </button>
                
                {/* Reaction Picker */}
                {showReactionPicker && (
                    <div className="reaction-picker">
                        {commonReactions.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAddReaction(emoji)}
                                title={`React with ${emoji}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Reply in Thread */}
            <button
                title="Reply in thread"
                onClick={() => onReplyInThread?.(messageId)}
            >
                <Reply className="h-4 w-4" />
            </button>

            {/* Share */}
            <button
                title="Share message"
                onClick={() => onShareMessage?.(messageId)}
            >
                <Share className="h-4 w-4" />
            </button>

            {/* Push to Tasks */}
            {!isTask && (
                <button
                    title="Push to Tasks"
                    onClick={() => onPushToTasks?.(messageId)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                >
                    <CheckSquare className="h-4 w-4" />
                </button>
            )}

            {/* More Actions */}
            <div className="relative">
                <button
                    title="More actions"
                    onClick={() => setShowMoreActions(!showMoreActions)}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                {/* More Actions Menu */}
                {showMoreActions && (
                    <div className="more-actions-menu">
                        <button
                            onClick={() => {
                                onBookmarkMessage?.(messageId);
                                setShowMoreActions(false);
                            }}
                        >
                            <Bookmark className="h-4 w-4" />
                            Save for later
                        </button>
                        <button
                            onClick={handleCopyMessage}
                        >
                            <Copy className="h-4 w-4" />
                            Copy text
                        </button>
                        <button
                            onClick={() => {
                                onPinMessage?.(messageId);
                                setShowMoreActions(false);
                            }}
                        >
                            <Pin className="h-4 w-4" />
                            Pin to channel
                        </button>
                        <div className="divider"></div>
                        <button
                            onClick={() => {
                                onEditMessage?.(messageId);
                                setShowMoreActions(false);
                            }}
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit message
                        </button>
                        <button
                            className="danger"
                            onClick={() => {
                                onDeleteMessage?.(messageId);
                                setShowMoreActions(false);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete message
                        </button>
                        <div className="divider"></div>
                        <button
                            onClick={() => {
                                onReportMessage?.(messageId);
                                setShowMoreActions(false);
                            }}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Report message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageHoverActions; 