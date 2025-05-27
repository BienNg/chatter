import React from 'react';
import { useEmojis } from '../../../hooks/useEmojis';

const EmojiSuggestions = ({ messageContent, onEmojiSelect, className = '' }) => {
  const { getEmojiSuggestions } = useEmojis();
  
  // Get suggestions based on message content
  const suggestions = getEmojiSuggestions(messageContent);
  
  // Don't show if no suggestions or content is too short
  if (!suggestions.length || !messageContent || messageContent.trim().length < 3) {
    return null;
  }

  return (
    <div className={`emoji-suggestions ${className}`}>
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">Suggested:</span>
        <div className="flex items-center gap-1">
          {suggestions.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => onEmojiSelect(emoji)}
              className="p-1 text-sm hover:bg-gray-200 rounded transition-colors"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiSuggestions; 