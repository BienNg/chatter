import React, { useState, useEffect } from 'react';
import { 
    Pin, 
    Bookmark, 
    File, 
    Search, 
    Eye,
    EyeOff,
    ExternalLink,
    MessageSquare,
    X
} from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../contexts/AuthContext';

const ChannelToolbar = ({ channelId, onJumpToMessage, onOpenThread }) => {
    const [activeTab, setActiveTab] = useState('pinned');
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { currentUser } = useAuth();
    const { 
        getPinnedMessages, 
        togglePinMessage
    } = useMessages(channelId);

    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load pinned messages when tab changes or channel changes
    useEffect(() => {
        if (!channelId || activeTab !== 'pinned') return;
        loadPinnedMessages();
    }, [channelId, activeTab]);

    const loadPinnedMessages = async () => {
        setLoading(true);
        try {
            const pinned = await getPinnedMessages();
            setPinnedMessages(pinned || []);
        } catch (error) {
            console.error('Error loading pinned messages:', error);
            setPinnedMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    const handleToggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleUnpinMessage = async (messageId) => {
        try {
            await togglePinMessage(messageId);
            await loadPinnedMessages();
        } catch (error) {
            console.error('Error unpinning message:', error);
        }
    };

    const formatDistanceToNow = (date) => {
        if (!date) return 'Unknown time';
        
        const now = new Date();
        const messageDate = date.toDate ? date.toDate() : new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return messageDate.toLocaleDateString();
    };

    const renderPinnedMessages = () => {
        let filteredMessages = [...pinnedMessages];

        // Apply search filter
        if (searchQuery) {
            filteredMessages = filteredMessages.filter(msg => 
                msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.author?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filteredMessages.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Pin className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">
                        {searchQuery ? 'No matching pinned messages' : 'No pinned messages'}
                    </p>
                    <p className="text-xs">
                        {searchQuery 
                            ? 'Try adjusting your search' 
                            : 'Pin important messages to keep them easily accessible'
                        }
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {filteredMessages.map((message) => (
                    <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                                        {message.author?.displayName?.charAt(0) || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {message.author?.displayName || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(message.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                    {message.content}
                                </p>
                                {message.attachments?.length > 0 && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <File className="w-3 h-3" />
                                        <span>{message.attachments.length} attachment(s)</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                                <button
                                    onClick={() => onJumpToMessage(message.id)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Jump to message"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                {message.replyCount > 0 && (
                                    <button
                                        onClick={() => onOpenThread(message.id)}
                                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="Open thread"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleUnpinMessage(message.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Unpin message"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
            );
        }

        switch (activeTab) {
            case 'pinned':
                return renderPinnedMessages();
            case 'bookmarks':
                return (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <Bookmark className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Bookmarks coming soon</p>
                        <p className="text-xs">This feature will be available in the next update</p>
                    </div>
                );
            case 'files':
                return (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <File className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Files coming soon</p>
                        <p className="text-xs">This feature will be available in the next update</p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!channelId) return null;

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-6 py-2">
                <div className="flex items-center space-x-4">
                    {/* Tab Navigation */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handleTabChange('pinned')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'pinned'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                        >
                            <Pin className="w-4 h-4" />
                            <span>Pinned</span>
                            {pinnedMessages.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                                    {pinnedMessages.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('bookmarks')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'bookmarks'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Bookmarks</span>
                        </button>
                        <button
                            onClick={() => handleTabChange('files')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'files'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                        >
                            <File className="w-4 h-4" />
                            <span>Files</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex items-center bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm border-none outline-none bg-transparent w-48"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Expand/Collapse */}
                    <button
                        onClick={handleToggleExpanded}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {isExpanded && (
                <div className="px-6 pb-4 max-h-96 overflow-y-auto">
                    {renderTabContent()}
                </div>
            )}
        </div>
    );
};

export default ChannelToolbar; 