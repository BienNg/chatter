import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import EmojiPicker from './composition/EmojiPicker';

const MessageReactions = ({ 
  messageId, 
  reactions = [], 
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onViewReactionDetails,
  className = '' 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji and count them
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const { emoji, userId, user } = reaction;
    if (!acc[emoji]) {
      acc[emoji] = {
        emoji,
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[emoji].count++;
    acc[emoji].users.push(user);
    if (userId === currentUserId) {
      acc[emoji].hasCurrentUser = true;
    }
    return acc;
  }, {});

  const reactionGroups = Object.values(groupedReactions);

  const handleReactionClick = (emoji) => {
    const reactionGroup = groupedReactions[emoji];
    if (reactionGroup.hasCurrentUser) {
      // Remove reaction if user already reacted with this emoji
      onRemoveReaction?.(messageId, emoji);
    } else {
      // Add reaction if user hasn't reacted with this emoji
      onAddReaction?.(messageId, emoji);
    }
  };

  const handleAddNewReaction = (emoji) => {
    onAddReaction?.(messageId, emoji);
    setShowEmojiPicker(false);
  };

  const handleReactionDetails = (emoji, users) => {
    onViewReactionDetails?.(messageId, emoji, users);
  };

  return (
    <div className={`message-reactions flex flex-wrap items-center gap-1 mt-1 ${className} ${reactionGroups.length === 0 ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
      {reactionGroups.map(({ emoji, count, users, hasCurrentUser }) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          onDoubleClick={() => handleReactionDetails(emoji, users)}
          className={`reaction-button flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-200 hover:scale-105 ${
            hasCurrentUser
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
          title={`${users.map(u => u.name).join(', ')} reacted with ${emoji}`}
        >
          <span className="text-sm">{emoji}</span>
          <span className="font-medium">{count}</span>
          
          {/* Show user avatars for small counts */}
          {count <= 3 && (
            <div className="flex -space-x-1 ml-1">
              {users.slice(0, 3).map((user, index) => (
                <div
                  key={`${user.id}-${index}`}
                  className="w-4 h-4 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: user.color || '#6B7280' }}
                  title={user.name}
                >
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              ))}
            </div>
          )}
        </button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="add-reaction-button flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200"
          title="Add reaction"
        >
          <Plus className="w-3 h-3" />
        </button>

        {/* Emoji Picker for Adding Reactions */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <EmojiPicker
              onEmojiSelect={handleAddNewReaction}
              onClose={() => setShowEmojiPicker(false)}
              className="reaction-emoji-picker"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .reaction-button:active {
          transform: scale(0.95);
        }
        
        .add-reaction-button:hover {
          transform: scale(1.1);
        }
        
        .reaction-emoji-picker {
          width: 280px !important;
          max-height: 320px !important;
        }
      `}</style>
    </div>
  );
};

export default MessageReactions; 