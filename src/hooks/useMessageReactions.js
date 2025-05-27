import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const useMessageReactions = (channelId) => {
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Get current user data with proper fallbacks
  const getCurrentUserData = useCallback(() => {
    if (!currentUser) return null;
    
    return {
      id: currentUser.uid,
      displayName: userProfile?.displayName || userProfile?.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown User',
      email: currentUser.email,
      avatar: userProfile?.photo || null
    };
  }, [currentUser, userProfile]);

  // Real-time listener for reactions in the channel
  useEffect(() => {
    if (!channelId || !currentUser) {
      setReactions({});
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Listen to all reactions in this channel
    const reactionsRef = collection(db, 'channels', channelId, 'reactions');
    
    const unsubscribe = onSnapshot(
      reactionsRef,
      (snapshot) => {
        const reactionsByMessage = {};
        
        snapshot.docs.forEach((doc) => {
          const reaction = { id: doc.id, ...doc.data() };
          const messageId = reaction.messageId;
          
          if (!reactionsByMessage[messageId]) {
            reactionsByMessage[messageId] = [];
          }
          reactionsByMessage[messageId].push(reaction);
        });
        
        setReactions(reactionsByMessage);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to reactions:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [channelId, currentUser]);

  // Add a reaction to a message
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!channelId || !currentUser || !messageId || !emoji) {
      console.warn('Missing required parameters for addReaction');
      return;
    }

    const userData = getCurrentUserData();
    if (!userData) {
      console.warn('No user data available');
      return;
    }

    try {
      // Check if user already reacted with this emoji
      const messageReactions = reactions[messageId] || [];
      const existingReaction = messageReactions.find(
        r => r.userId === currentUser.uid && r.emoji === emoji
      );
      
      if (existingReaction) {
        console.log('User already reacted with this emoji');
        return;
      }

      // Add reaction to Firestore
      const reactionsRef = collection(db, 'channels', channelId, 'reactions');
      await addDoc(reactionsRef, {
        messageId,
        emoji,
        userId: currentUser.uid,
        user: userData,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }, [channelId, currentUser, reactions, getCurrentUserData]);

  // Remove a reaction from a message
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!channelId || !currentUser || !messageId || !emoji) {
      console.warn('Missing required parameters for removeReaction');
      return;
    }

    try {
      // Find the user's reaction with this emoji
      const messageReactions = reactions[messageId] || [];
      const reactionToRemove = messageReactions.find(
        r => r.userId === currentUser.uid && r.emoji === emoji
      );
      
      if (!reactionToRemove) {
        console.log('No reaction found to remove');
        return;
      }

      // Remove reaction from Firestore
      const reactionRef = doc(db, 'channels', channelId, 'reactions', reactionToRemove.id);
      await deleteDoc(reactionRef);

    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }, [channelId, currentUser, reactions]);

  // Toggle a reaction (add if not present, remove if present)
  const toggleReaction = useCallback(async (messageId, emoji) => {
    if (!channelId || !currentUser || !messageId || !emoji) {
      console.warn('Missing required parameters for toggleReaction');
      return;
    }

    const messageReactions = reactions[messageId] || [];
    const hasReaction = messageReactions.some(
      r => r.userId === currentUser.uid && r.emoji === emoji
    );

    if (hasReaction) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  }, [reactions, currentUser, channelId, addReaction, removeReaction]);

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
        
        if (userId === currentUser?.uid) {
          acc[emoji].hasCurrentUser = true;
        }
      }
      
      return acc;
    }, {});

    // Convert to array and remove userIds set (not needed in UI)
    return Object.values(summary).map(({ userIds, ...rest }) => rest);
  }, [reactions, currentUser?.uid]);

  // Check if current user has reacted to a message with a specific emoji
  const hasUserReacted = useCallback((messageId, emoji) => {
    if (!currentUser) return false;
    
    const messageReactions = reactions[messageId] || [];
    return messageReactions.some(
      r => r.userId === currentUser.uid && r.emoji === emoji
    );
  }, [reactions, currentUser?.uid]);

  // Get total reaction count for a message
  const getReactionCount = useCallback((messageId) => {
    const messageReactions = reactions[messageId] || [];
    return messageReactions.length;
  }, [reactions]);

  // Clean up reactions for deleted messages (utility function)
  const cleanupReactionsForMessage = useCallback(async (messageId) => {
    if (!channelId || !messageId) return;

    try {
      const reactionsRef = collection(db, 'channels', channelId, 'reactions');
      const q = query(reactionsRef, where('messageId', '==', messageId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
    } catch (error) {
      console.error('Error cleaning up reactions:', error);
    }
  }, [channelId]);

  return {
    reactions,
    loading,
    currentUser: getCurrentUserData(),
    addReaction,
    removeReaction,
    toggleReaction,
    getMessageReactions,
    getReactionSummary,
    hasUserReacted,
    getReactionCount,
    cleanupReactionsForMessage
  };
}; 