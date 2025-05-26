// src/components/CommentComposition.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  BellOff, 
  Users, 
  MessageSquare,
  Send,
  Smile,
  AtSign,
  Link2
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useDrafts } from '../../../hooks/useDrafts';

const CommentComposition = ({ channelId, threadId, onSendMessage }) => {
  const [comment, setComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(true);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const richEditorRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  const { getDraft, saveDraft, clearDraft, hasDraft } = useDrafts();

  const threadSummary = {
    replies: 3,
    participants: [
      { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
      { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
      { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' }
    ],
    lastActivity: '2 minutes ago'
  };

  // Load draft on mount or thread change
  useEffect(() => {
    if (channelId && threadId) {
      const draft = getDraft(channelId, threadId);
      if (draft) {
        setComment(draft.content || '');
      } else {
        setComment('');
      }
    }
  }, [channelId, threadId, getDraft]);

  // Auto-save draft with debouncing
  const autoSaveDraft = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (channelId && threadId && comment.trim()) {
        saveDraft(channelId, comment, [], threadId);
      }
    }, 1000);
  }, [channelId, threadId, comment, saveDraft]);

  // Trigger auto-save when content changes
  useEffect(() => {
    autoSaveDraft();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSaveDraft]);

  const handleSend = () => {
    if (comment.trim()) {
      onSendMessage?.({
        content: comment.trim()
      });
      
      // Clear draft after sending
      if (channelId && threadId) {
        clearDraft(channelId, threadId);
      }
      
      setComment('');
      
              // Clear the rich text editor
        if (richEditorRef.current) {
          richEditorRef.current.innerHTML = '';
        }
    }
  };

  // Always use rich text

  const isDraftSaved = channelId && threadId && hasDraft(channelId, threadId);

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Thread Context Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Reply to Thread</h3>
          <div className="relative">
            <button 
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className={`p-1.5 rounded-md transition ${isFollowing ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'}`}
              title={isFollowing ? 'Following thread' : 'Not following thread'}
            >
              {isFollowing ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>

            {/* Notification Settings Dropdown */}
            {showNotificationSettings && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setIsFollowing(true);
                      setShowNotificationSettings(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${isFollowing ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Follow thread</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsFollowing(false);
                      setShowNotificationSettings(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${!isFollowing ? 'text-gray-700' : 'text-gray-500'}`}
                  >
                    <BellOff className="h-4 w-4" />
                    <span>Unfollow thread</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thread Summary */}
        <div className="space-y-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{threadSummary.replies} replies</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{threadSummary.participants.length} participants</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1">
              {threadSummary.participants.map(participant => (
                <div 
                  key={participant.name}
                  className={`w-5 h-5 rounded-full ${participant.color} flex items-center justify-center text-white text-xs font-medium ring-1 ring-white`}
                  title={participant.name}
                >
                  {participant.avatar}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500">Last activity {threadSummary.lastActivity}</span>
          </div>
        </div>
      </div>

      {/* Original Message Context */}
      <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
        <div className="text-xs font-medium text-gray-600 mb-2">REPLYING TO</div>
        <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-500">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              SJ
            </div>
            <span className="font-medium text-gray-900 text-sm">Sarah Johnson</span>
            <span className="text-xs text-gray-500">10:30 AM</span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            Here's the worksheet for today's exercises: Can everyone please complete exercises 1-5 for homework?
          </div>
        </div>
      </div>

      {/* Comment Input Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-4 flex-1">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">
              BN
            </div>
            <div className="flex-grow">
              {/* Rich Text Editor */}
              <RichTextEditor
                ref={richEditorRef}
                value={comment}
                onChange={setComment}
                placeholder="Add a comment to this thread..."
                className="border border-gray-200 rounded-lg"
                isDraftSaved={isDraftSaved}
              />
            </div>
          </div>
        </div>

        {/* Composition Tools */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
                <Smile className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
                <AtSign className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-500">
                {isFollowing ? 'You\'ll be notified of replies' : 'You won\'t be notified'}
              </div>
              <button 
                onClick={handleSend}
                disabled={!comment.trim()}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center space-x-2 ${
                  comment.trim() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComposition;