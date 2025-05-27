import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chatter_message_reactions';

// Mock user data - in a real app, this would come from your auth system
const getCurrentUser = () => ({
  id: 'current-user-id',
  name: 'Current User',
  avatar: 'CU',
  color: '#3B82F6'
});

const getMockUsers = () => ({
  'user-1': { id: 'user-1', name: 'Sarah Johnson', avatar: 'SJ', color: '#EF4444' },
  'user-2': { id: 'user-2', name: 'Alex Chen', avatar: 'AC', color: '#10B981' },
  'user-3': { id: 'user-3', name: 'Mai Tran', avatar: 'MT', color: '#F59E0B' },
  'user-4': { id: 'user-4', name: 'John Doe', avatar: 'JD', color: '#8B5CF6' },
  'current-user-id': getCurrentUser()
});

export const useMessageReactions = () => {
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const users = getMockUsers();

  // Load reactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedReactions = JSON.parse(stored);
        setReactions(parsedReactions);
      }
    } catch (error) {
      console.warn('Failed to load message reactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save reactions to localStorage whenever reactions change
  const saveReactions = useCallback((newReactions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReactions));
    } catch (error) {
      console.warn('Failed to save message reactions:', error);
    }
  }, []);

  // Add a reaction to a message
  const addReaction = useCallback((messageId, emoji) => {
    setReactions(prevReactions => {
      const messageReactions = prevReactions[messageId] || [];
      
      // Check if user already reacted with this emoji
      const existingReaction = messageReactions.find(
        r => r.userId === currentUser.id && r.emoji === emoji
      );
      
      if (existingReaction) {
        // User already reacted with this emoji, don't add duplicate
        return prevReactions;
      }

      const newReaction = {
        id: `${messageId}-${emoji}-${currentUser.id}-${Date.now()}`,
        messageId,
        emoji,
        userId: currentUser.id,
        user: currentUser,
        timestamp: new Date().toISOString()
      };

      const updatedReactions = {
        ...prevReactions,
        [messageId]: [...messageReactions, newReaction]
      };

      saveReactions(updatedReactions);
      return updatedReactions;
    });
  }, [currentUser, saveReactions]);

  // Remove a reaction from a message
  const removeReaction = useCallback((messageId, emoji) => {
    setReactions(prevReactions => {
      const messageReactions = prevReactions[messageId] || [];
      
      const updatedMessageReactions = messageReactions.filter(
        r => !(r.userId === currentUser.id && r.emoji === emoji)
      );

      const updatedReactions = {
        ...prevReactions,
        [messageId]: updatedMessageReactions
      };

      // Remove the message key if no reactions left
      if (updatedMessageReactions.length === 0) {
        delete updatedReactions[messageId];
      }

      saveReactions(updatedReactions);
      return updatedReactions;
    });
  }, [currentUser, saveReactions]);

  // Toggle a reaction (add if not present, remove if present)
  const toggleReaction = useCallback((messageId, emoji) => {
    const messageReactions = reactions[messageId] || [];
    const hasReaction = messageReactions.some(
      r => r.userId === currentUser.id && r.emoji === emoji
    );

    if (hasReaction) {
      removeReaction(messageId, emoji);
    } else {
      addReaction(messageId, emoji);
    }
  }, [reactions, currentUser.id, addReaction, removeReaction]);

  // Get reactions for a specific message
  const getMessageReactions = useCallback((messageId) => {
    return reactions[messageId] || [];
  }, [reactions]);

  // Get reaction summary for a message (grouped by emoji)
  const getReactionSummary = useCallback((messageId) => {
    const messageReactions = reactions[messageId] || [];
    
    const summary = messageReactions.reduce((acc, reaction) => {
      const { emoji, userId, user } = reaction;
      if (!acc[emoji]) {
        acc[emoji] = {
          emoji,
          count: 0,
          users: [],
          userIds: new Set(),
          hasCurrentUser: false
        };
      }
      
      // Avoid duplicate users (shouldn't happen, but safety check)
      if (!acc[emoji].userIds.has(userId)) {
        acc[emoji].count++;
        acc[emoji].users.push(user);
        acc[emoji].userIds.add(userId);
        
        if (userId === currentUser.id) {
          acc[emoji].hasCurrentUser = true;
        }
      }
      
      return acc;
    }, {});

    // Convert to array and remove userIds set (not needed in UI)
    return Object.values(summary).map(({ userIds, ...rest }) => rest);
  }, [reactions, currentUser.id]);

  // Check if current user has reacted to a message with a specific emoji
  const hasUserReacted = useCallback((messageId, emoji) => {
    const messageReactions = reactions[messageId] || [];
    return messageReactions.some(
      r => r.userId === currentUser.id && r.emoji === emoji
    );
  }, [reactions, currentUser.id]);

  // Get total reaction count for a message
  const getReactionCount = useCallback((messageId) => {
    const messageReactions = reactions[messageId] || [];
    return messageReactions.length;
  }, [reactions]);

  // Add some mock reactions for demonstration (only on first load)
  useEffect(() => {
    if (!loading && Object.keys(reactions).length === 0) {
      // Add some sample reactions for demo purposes
      const sampleReactions = {
        'message-1': [
          {
            id: 'reaction-1',
            messageId: 'message-1',
            emoji: '❤️',
            userId: 'user-1',
            user: users['user-1'],
            timestamp: new Date().toISOString()
          },
          {
            id: 'reaction-2',
            messageId: 'message-1',
            emoji: '👍',
            userId: 'user-2',
            user: users['user-2'],
            timestamp: new Date().toISOString()
          },
          {
            id: 'reaction-3',
            messageId: 'message-1',
            emoji: '👍',
            userId: 'user-3',
            user: users['user-3'],
            timestamp: new Date().toISOString()
          }
        ],
        'message-2': [
          {
            id: 'reaction-4',
            messageId: 'message-2',
            emoji: '🔥',
            userId: 'user-1',
            user: users['user-1'],
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      setReactions(sampleReactions);
      saveReactions(sampleReactions);
    }
  }, [loading, reactions, users, saveReactions]);

  return {
    reactions,
    loading,
    currentUser,
    addReaction,
    removeReaction,
    toggleReaction,
    getMessageReactions,
    getReactionSummary,
    hasUserReacted,
    getReactionCount
  };
}; 