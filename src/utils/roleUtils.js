// src/utils/roleUtils.js
export const hasManagementRole = (userRoles) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    
    return userRoles.some((role) => 
        role.id === 'manager' || 
        role.id === 'admin' ||
        role.name?.toLowerCase().includes('manager') ||
        role.name?.toLowerCase().includes('admin')
    );
};

export const canDeleteChannel = (userRoles) => {
    return hasManagementRole(userRoles);
};

export const canManageChannelMembers = (userRoles, channel, userId) => {
    // Channel creator or admin can manage members
    return channel.createdBy === userId || 
           channel.admins?.includes(userId) ||
           hasManagementRole(userRoles);
};