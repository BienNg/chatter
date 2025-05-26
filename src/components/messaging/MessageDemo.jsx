import React, { useState } from 'react';
import MessageHoverActions from './MessageHoverActions';

const MessageDemo = () => {
    const [hoveredMessage, setHoveredMessage] = useState(null);
    
    const sampleMessages = [
        {
            id: '1',
            author: { displayName: 'John Doe', email: 'john@example.com' },
            content: 'Hey everyone! Just wanted to share some exciting news about our project progress. We\'ve successfully implemented the new messaging system with real-time updates!',
            createdAt: new Date(),
            reactions: [
                { emoji: '👍', count: 3 },
                { emoji: '🎉', count: 2 }
            ]
        },
        {
            id: '2',
            author: { displayName: 'Jane Smith', email: 'jane@example.com' },
            content: 'That\'s awesome! The hover actions look exactly like Slack now. Great work on the implementation!',
            createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        },
        {
            id: '3',
            author: { displayName: 'Mike Johnson', email: 'mike@example.com' },
            content: 'I love the smooth animations and the reaction picker. The UX feels very polished.',
            createdAt: new Date(Date.now() - 600000), // 10 minutes ago
        }
    ];

    const handleAddReaction = (messageId, emoji) => {
        console.log(`Added ${emoji} reaction to message ${messageId}`);
    };

    const handleReplyInThread = (messageId) => {
        console.log(`Opening thread for message ${messageId}`);
    };

    const handleShareMessage = (messageId) => {
        console.log(`Sharing message ${messageId}`);
    };

    const handleBookmarkMessage = (messageId) => {
        console.log(`Bookmarking message ${messageId}`);
    };

    const handleEditMessage = (messageId) => {
        console.log(`Editing message ${messageId}`);
    };

    const handleDeleteMessage = (messageId) => {
        console.log(`Deleting message ${messageId}`);
    };

    const handlePinMessage = (messageId) => {
        console.log(`Pinning message ${messageId}`);
    };

    const handleReportMessage = (messageId) => {
        console.log(`Reporting message ${messageId}`);
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diffInMinutes = (now - timestamp) / (1000 * 60);
        
        if (diffInMinutes < 1) {
            return 'just now';
        } else if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)}m ago`;
        } else {
            return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Slack-Style Message Hover Actions Demo</h2>
                <p className="text-gray-600 mb-8">Hover over any message to see the action buttons appear. Try clicking on the reaction button, thread reply, share, and more actions menu.</p>
                
                <div className="space-y-6">
                    {sampleMessages.map((message) => (
                        <div
                            key={message.id}
                            className="message-container relative group hover:bg-gray-50 rounded-lg p-4 -m-2 transition-colors duration-150"
                            onMouseEnter={() => setHoveredMessage(message.id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium text-lg">
                                    {message.author.displayName.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                            {message.author.displayName}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatTimestamp(message.createdAt)}
                                        </span>
                                    </div>

                                    <div className="text-gray-800 text-left break-words whitespace-pre-wrap">
                                        {message.content}
                                    </div>

                                    {/* Reactions */}
                                    {message.reactions && message.reactions.length > 0 && (
                                        <div className="mt-3 flex items-center flex-wrap gap-2">
                                            {message.reactions.map((reaction, idx) => (
                                                <button
                                                    key={idx}
                                                    className="inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-sm transition-colors duration-150 border border-blue-200"
                                                >
                                                    <span className="mr-1">{reaction.emoji}</span>
                                                    <span className="text-blue-700 font-medium">{reaction.count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hover Actions */}
                            {hoveredMessage === message.id && (
                                <MessageHoverActions
                                    messageId={message.id}
                                    messageContent={message.content}
                                    onReplyInThread={handleReplyInThread}
                                    onAddReaction={handleAddReaction}
                                    onShareMessage={handleShareMessage}
                                    onBookmarkMessage={handleBookmarkMessage}
                                    onEditMessage={handleEditMessage}
                                    onDeleteMessage={handleDeleteMessage}
                                    onPinMessage={handlePinMessage}
                                    onReportMessage={handleReportMessage}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Features Implemented:</h3>
                    <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Smooth hover animations with fade-in effect</li>
                        <li>• Reaction picker with common emojis</li>
                        <li>• Thread reply functionality</li>
                        <li>• Share message option</li>
                        <li>• More actions dropdown with edit, delete, pin, bookmark, copy, and report</li>
                        <li>• Click outside to close dropdowns</li>
                        <li>• Proper z-index stacking and positioning</li>
                        <li>• Slack-like visual design and interactions</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MessageDemo; 