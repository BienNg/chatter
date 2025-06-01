import React from 'react';
import { 
  Hash,
  Users,
  Settings,
  MessageSquare,
  User,
  DollarSign,
  Plus
} from 'lucide-react';
import { generateChannelUrl, getMiddleClickHandlers } from '../../../utils/navigation';

/**
 * ChannelList - Organized channel display with grouping
 * Handles channel grouping by type and visual organization
 * Excludes DM channels which are handled by DirectMessages component
 */
export const ChannelList = ({ channels, activeChannelId, onChannelSelect }) => {
  // Filter out DM channels - they're handled by DirectMessages component
  const regularChannels = channels.filter(channel => 
    !channel.isDM && channel.type !== 'direct-message'
  );

  // Channel type metadata
  const typeMetadata = {
    'general': {
      icon: Hash,
      label: 'General Channels',
      description: 'General discussion and announcements'
    },
    'team': {
      icon: Users,
      label: 'Team Channels',
      description: 'Team collaboration and meetings'
    },
    'project': {
      icon: Settings,
      label: 'Project Channels',
      description: 'Project-specific discussions'
    },
    'social': {
      icon: MessageSquare,
      label: 'Social Channels',
      description: 'Casual conversations and social topics'
    },
    'support': {
      icon: User,
      label: 'Support Channels',
      description: 'Help and support discussions'
    },
    'sales': {
      icon: DollarSign,
      label: 'Sales Channels', 
      description: 'Sales and business discussions'
    }
  };

  // Group channels by type
  const groupedChannels = regularChannels.reduce((groups, channel) => {
    const type = channel.type || 'general';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(channel);
    return groups;
  }, {});

  // Sort groups by priority and channels within groups by name
  const sortedGroups = Object.entries(groupedChannels)
    .sort(([a], [b]) => {
      const priority = { general: 0, team: 1, project: 2, social: 3, support: 4, sales: 5 };
      return (priority[a] || 999) - (priority[b] || 999);
    })
    .map(([type, channelList]) => [
      type,
      channelList.sort((a, b) => a.name.localeCompare(b.name))
    ]);

  const renderChannel = (channel) => {
    const Icon = typeMetadata[channel.type]?.icon || Hash;
    const isActive = channel.id === activeChannelId;
    const url = generateChannelUrl(channel.id, 'messages');
    
    return (
      <button
        key={channel.id}
        onClick={() => onChannelSelect(channel.id)}
        {...getMiddleClickHandlers(url)}
        className={`flex items-center w-full px-3 py-2 rounded-lg mb-1 transition-colors group ${
          isActive
            ? 'bg-indigo-700 text-white'
            : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
        <span 
          className="truncate font-normal"
          title={channel.name}
        >
          {channel.name}
        </span>
      </button>
    );
  };

  if (regularChannels.length === 0) {
    return (
      <div className="text-center py-8">
        <Hash className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <p className="text-indigo-300 text-sm mb-4">No channels available</p>
        <button className="text-indigo-400 hover:text-white text-sm flex items-center mx-auto">
          <Plus className="w-4 h-4 mr-1" />
          Create Channel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedGroups.map(([type, channelList]) => {
        const metadata = typeMetadata[type] || typeMetadata.general;
        
        return (
          <div key={type} className="space-y-1">
            {/* Group Header */}
            <div className="flex items-center px-2 py-1 mb-2">
              <metadata.icon className="w-3 h-3 mr-2 text-indigo-300" />
              <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
                {metadata.label}
              </span>
              <div className="flex-1 h-px bg-indigo-700/30 ml-2"></div>
            </div>
            
            {/* Channels in Group */}
            <div className="space-y-1">
              {channelList.map(renderChannel)}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 