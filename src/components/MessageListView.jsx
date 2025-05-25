// src/components/MessageListView.jsx
import React, { useState, useEffect } from 'react';
import MessageComposition from './MessageComposition';
import {
    MessageSquare,
    Smile,
    MoreHorizontal,
    Reply,
    Forward,
    Heart,
    ThumbsUp,
    Download,
    FileText
} from 'lucide-react';

const MessageListView = ({ messages: propMessages, onOpenThread, onNewMessage }) => {
    const [messages, setMessages] = useState(propMessages || []);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState(['Mai Tran']);

    // Update local messages when props change
    useEffect(() => {
        if (propMessages) {
            setMessages(propMessages);
        }
    }, [propMessages]);

    const handleThreadClick = (messageId) => {
        onOpenThread?.(messageId);
    };

    const handleNewMessage = (newMessage) => {
        onNewMessage?.(newMessage);
    };

    const handleReaction = (messageId, emoji) => {
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id === messageId) {
                    const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
                    if (existingReaction) {
                        return {
                            ...msg,
                            reactions: msg.reactions.map((r) =>
                                r.emoji === emoji
                                    ? { ...r, count: r.count + 1, users: [...r.users, 'Bien Nguyen'] }
                                    : r
                            )
                        };
                    } else {
                        return {
                            ...msg,
                            reactions: [...msg.reactions, { emoji, count: 1, users: ['Bien Nguyen'] }]
                        };
                    }
                }
                return msg;
            })
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Message Actions Bar */}
            <div className="px-4 py-2 border-b border-gray-200 flex items-center space-x-2">
                <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
                <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                </button>
                <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="message-container relative"
                        onMouseEnter={() => setHoveredMessage(message.id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                    >
                        <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-full ${message.user.color} flex-shrink-0 flex items-center justify-center text-white font-medium relative`}>
                                {message.user.avatar}
                                {message.user.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>

                            <div className="ml-3 flex-grow">
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-900">{message.user.name}</span>
                                    <span className="ml-2 text-xs text-gray-500">{message.timestamp}</span>
                                </div>

                                <div className="mt-1 text-gray-800 text-left">
                                    {message.content}
                                </div>

                                {/* File Attachment */}
                                {message.attachment && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center max-w-sm">
                                        <FileText className="h-6 w-6 text-indigo-500 mr-3" />
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-gray-800">{message.attachment.name}</p>
                                            <p className="text-xs text-gray-500">PDF • {message.attachment.size}</p>
                                        </div>
                                        <button className="ml-auto text-indigo-600 hover:text-indigo-700">
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Reactions */}
                                {message.reactions.length > 0 && (
                                    <div className="mt-2 flex items-center space-x-1">
                                        {message.reactions.map((reaction, idx) => (
                                            <button
                                                key={idx}
                                                className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                                                title={reaction.users.join(', ')}
                                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                            >
                                                <span className="mr-1">{reaction.emoji}</span>
                                                <span className="text-gray-700 font-medium">{reaction.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Thread Indicator */}
                                {message.threadCount > 0 && (
                                    <button
                                        onClick={() => handleThreadClick(message.id)}
                                        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 px-2 py-1 rounded transition"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hover Actions */}
                        {hoveredMessage === message.id && (
                            <div className="message-hover-options absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-sm p-1 flex items-center space-x-1">
                                <button
                                    className="hover-button p-1.5 hover:bg-gray-100 rounded text-gray-600"
                                    title="Add reaction"
                                    onClick={() => handleReaction(message.id, '👍')}
                                >
                                    <Smile className="h-4 w-4" />
                                </button>
                                <button
                                    className="hover-button p-1.5 hover:bg-gray-100 rounded text-gray-600"
                                    title="Reply in thread"
                                    onClick={() => handleThreadClick(message.id)}
                                >
                                    <Reply className="h-4 w-4" />
                                </button>
                                <button className="hover-button p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Forward">
                                    <Forward className="h-4 w-4" />
                                </button>
                                <button className="hover-button p-1.5 hover:bg-gray-100 rounded text-gray-600" title="More actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center text-gray-500 text-sm">
                        <div className="flex space-x-1 mr-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageComposition onSendMessage={handleNewMessage} />
        </div>
    );
};

export default MessageListView;