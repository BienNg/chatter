// src/components/NestedComments.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  ArrowUpRight,
  CornerDownRight
} from 'lucide-react';
import { useDrafts } from '../../../hooks/useDrafts';

const NestedComments = ({ channelId, threadId }) => {
  const [expandedThreads, setExpandedThreads] = useState(new Set([1]));
  const [replyText, setReplyText] = useState('');
  const autoSaveTimeoutRef = useRef(null);
  const { getDraft, saveDraft, clearDraft, hasDraft } = useDrafts();
  const [nestedComments] = useState([
    {
      id: 1,
      user: { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
      content: 'I need help with exercise 3. The grammar seems more complex than usual.',
      timestamp: '10:35 AM',
      level: 0,
      replies: [
        {
          id: 11,
          user: { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
          content: 'What specific part is confusing you?',
          timestamp: '10:37 AM',
          level: 1,
          replies: [
            {
              id: 111,
              user: { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
              content: 'The passive voice construction with past perfect tense. I can\'t figure out the word order.',
              timestamp: '10:39 AM',
              level: 2,
              replies: []
            }
          ]
        },
        {
          id: 12,
          user: { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' },
          content: 'I had the same question! Thanks for asking.',
          timestamp: '10:38 AM',
          level: 1,
          replies: []
        }
      ]
    },
    {
      id: 2,
      user: { name: 'John Doe', avatar: 'JD', color: 'bg-yellow-500' },
      content: 'When is the assignment due?',
      timestamp: '10:42 AM',
      level: 0,
      replies: [
        {
          id: 21,
          user: { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
          content: 'Friday before class starts.',
          timestamp: '10:43 AM',
          level: 1,
          replies: []
        }
      ]
    }
  ]);

  // Load draft on mount or thread change
  useEffect(() => {
    if (channelId && threadId) {
      const draft = getDraft(channelId, threadId);
      if (draft) {
        setReplyText(draft.content || '');
      } else {
        setReplyText('');
      }
    }
  }, [channelId, threadId, getDraft]);

  // Auto-save draft with debouncing
  const autoSaveDraft = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (channelId && threadId && replyText.trim()) {
        saveDraft(channelId, replyText, [], threadId);
      }
    }, 1000);
  }, [channelId, threadId, replyText, saveDraft]);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (channelId && threadId && replyText.trim()) {
      autoSaveDraft();
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [replyText, autoSaveDraft]);

  const handleSendReply = () => {
    if (replyText.trim()) {
      // Handle sending the reply here
      console.log('Sending reply:', replyText);
      
      // Clear draft after sending
      if (channelId && threadId) {
        clearDraft(channelId, threadId);
      }
      
      setReplyText('');
    }
  };

  const toggleThread = (commentId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedThreads(newExpanded);
  };

  const getIndentLevel = (level) => {
    const indentWidth = Math.min(level * 24, 48); // Max indent of 48px
    return { paddingLeft: `${indentWidth}px` };
  };

  const isDraftSaved = channelId && threadId && hasDraft(channelId, threadId);

  const renderComment = (comment, parentId = null) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedThreads.has(comment.id);

    return (
      <div key={comment.id} className="relative">
        {/* Connecting Lines */}
        {comment.level > 0 && (
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200"></div>
        )}
        
        <div 
          className="relative flex items-start space-x-3 py-2"
          style={getIndentLevel(comment.level)}
        >
          {/* Thread connector for nested comments */}
          {comment.level > 0 && (
            <div className="absolute -left-3 top-4 w-3 h-px bg-gray-200"></div>
          )}
          
          {/* Collapse/Expand Button */}
          {hasReplies && (
            <button
              onClick={() => toggleThread(comment.id)}
              className="flex-shrink-0 p-0.5 hover:bg-gray-100 rounded transition mt-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          
          {/* Avatar */}
          <div className={`w-6 h-6 rounded-full ${comment.user.color} flex-shrink-0 flex items-center justify-center text-white text-xs font-medium`}>
            {comment.user.avatar}
          </div>
          
          {/* Comment Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900 text-sm">{comment.user.name}</span>
              <span className="text-xs text-gray-500">{comment.timestamp}</span>
              {comment.level > 0 && (
                <CornerDownRight className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            <div className="text-gray-800 text-sm leading-relaxed text-left">
              {comment.content}
            </div>
            
            {/* Comment Actions */}
            <div className="mt-2 flex items-center space-x-3">
              <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium">
                Reply
              </button>
              {hasReplies && (
                <button 
                  onClick={() => toggleThread(comment.id)}
                  className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center space-x-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
              {parentId && (
                <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center space-x-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Jump to context</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, comment.id))}
          </div>
        )}
        
        {/* Collapsed Thread Summary */}
        {hasReplies && !isExpanded && (
          <div 
            className="mt-2 py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
            style={getIndentLevel(comment.level + 1)}
            onClick={() => toggleThread(comment.id)}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex -space-x-1">
                {comment.replies.slice(0, 3).map((reply, idx) => (
                  <div 
                    key={idx}
                    className={`w-5 h-5 rounded-full ${reply.user.color} flex items-center justify-center text-white text-xs font-medium ring-1 ring-white`}
                  >
                    {reply.user.avatar}
                  </div>
                ))}
                {comment.replies.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium ring-1 ring-white">
                    +{comment.replies.length - 3}
                  </div>
                )}
              </div>
              <span>
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Thread Discussion</h3>
        <div className="mt-1 text-sm text-gray-600">
          {nestedComments.length} top-level comments
        </div>
      </div>
      
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {nestedComments.map(comment => renderComment(comment))}
        </div>
      </div>
      
      {/* Quick Reply */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium">
            BN
          </div>
          <div className="flex-grow">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Add to discussion..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            {isDraftSaved && (
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                <span>Draft saved</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
              replyText.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NestedComments;