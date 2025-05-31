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
    'general': { label: 'General', icon: Hash, color: 'text-indigo-300' },
    'class': { label: 'Classes', icon: Users, color: 'text-cyan-300' },
    'management': { label: 'Management', icon: Settings, color: 'text-purple-300' },
    'social-media': { label: 'Social Media', icon: MessageSquare, color: 'text-pink-300' },
    'customer-support': { label: 'Support', icon: User, color: 'text-green-300' },
    'bookkeeping': { label: 'Finance', icon: DollarSign, color: 'text-yellow-300' },
    'import': { label: 'Import', icon: Plus, color: 'text-orange-300' }
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

  // Sort groups by priority
  const groupOrder = ['general', 'class', 'management', 'social-media', 'customer-support', 'bookkeeping', 'import'];
  const sortedGroups = groupOrder.filter(type => groupedChannels[type]);

  return (
    <>
      {sortedGroups.map((type, groupIndex) => {
        const channels = groupedChannels[type];
        const metadata = typeMetadata[type] || typeMetadata['general'];
        const IconComponent = metadata.icon;

        return (
          <div key={type} className={groupIndex > 0 ? 'mt-4' : ''}>
            {/* Group Header - only show if more than one group exists */}
            {sortedGroups.length > 1 && (
              <div className="flex items-center px-2 py-1 mb-1">
                <IconComponent className={`w-3 h-3 mr-2 ${metadata.color}`} />
                <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
                  {metadata.label}
                </span>
                <div className="flex-1 h-px bg-indigo-700/30 ml-2"></div>
              </div>
            )}
            
            {/* Channels in this group */}
            {channels.map((channel) => {
              const channelUrl = generateChannelUrl(channel.id);
              const middleClickHandlers = getMiddleClickHandlers(
                channelUrl,
                () => onChannelSelect(channel.id)
              );

              return (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  {...middleClickHandlers}
                  className={`flex items-center w-full px-3 py-2 rounded-lg mb-1 transition-colors ${
                    channel.id === activeChannelId
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-700/50'
                  }`}
                >
                  <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {/* Subtle type indicator dot */}
                  {sortedGroups.length > 1 && (
                    <div 
                      className={`w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0 ${
                        channel.id === activeChannelId 
                          ? 'bg-white/60' 
                          : metadata.color.replace('text-', 'bg-').replace('-300', '-400')
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}; 