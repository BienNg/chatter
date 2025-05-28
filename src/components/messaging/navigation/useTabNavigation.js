import { useNavigate } from 'react-router-dom';

/**
 * useTabNavigation - Custom hook for tab navigation logic
 * Handles tab switching and channel-specific tab configuration
 */
export const useTabNavigation = (channelId, channels) => {
  const navigate = useNavigate();

  // Dynamic tabs based on channel type
  const getTabsForChannel = (channel) => {
    const baseTabs = [
      { id: 'messages', label: 'Messages' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'wiki', label: 'Wiki' }
    ];

    // Only show Classes tab for channels with type "class"
    if (channel?.type === 'class') {
      baseTabs.splice(1, 0, { id: 'classes', label: 'Classes' });
    }

    return baseTabs;
  };

  const handleTabSelect = (tab) => {
    if (!channelId) return;
    
    // Navigate to the selected tab
    switch (tab.toLowerCase()) {
      case 'messages':
        navigate(`/channels/${channelId}/messages`);
        break;
      case 'tasks':
        navigate(`/channels/${channelId}/tasks`);
        break;
      case 'classes':
        navigate(`/channels/${channelId}/classes`);
        break;
      case 'wiki':
        navigate(`/channels/${channelId}/wiki`);
        break;
      default:
        navigate(`/channels/${channelId}/messages`);
    }
  };

  const handleChannelSelect = (newChannelId) => {
    // Check if current tab is valid for the new channel
    const newChannel = channels.find(ch => ch.id === newChannelId);
    const availableTabs = getTabsForChannel(newChannel);
    
    // Default to messages tab for new channel
    navigate(`/channels/${newChannelId}/messages`);
  };

  return {
    getTabsForChannel,
    handleTabSelect,
    handleChannelSelect
  };
}; 