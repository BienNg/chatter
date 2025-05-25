// src/components/CreateChannel.jsx
import React, { useState } from 'react';
import { X, Hash, Lock } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';

const CreateChannel = ({ isOpen, onClose, onChannelCreated }) => {
    const [channelData, setChannelData] = useState({
        name: '',
        description: '',
        type: 'general',
        isPrivate: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();

    const channelTypes = [
        { id: 'general', name: 'General', description: 'General team discussions' },
        { id: 'project', name: 'Project', description: 'Project-specific coordination' },
        { id: 'department', name: 'Department', description: 'Department-level communication' },
        { id: 'announcement', name: 'Announcement', description: 'Important announcements' },
        { id: 'social', name: 'Social', description: 'Casual team conversations' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!channelData.name.trim()) {
            setError('Channel name is required');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const channelRef = await addDoc(collection(db, 'channels'), {
                name: channelData.name.trim(),
                description: channelData.description.trim(),
                type: channelData.type,
                members: [currentUser.uid], // Creator is automatically a member
                admins: [currentUser.uid], // Creator is automatically an admin
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                settings: {
                    allowMemberInvites: false,
                    isPrivate: channelData.isPrivate,
                    notifications: true
                }
            });

            onChannelCreated?.(channelRef.id);
            
            // Reset form
            setChannelData({
                name: '',
                description: '',
                type: 'general',
                isPrivate: true
            });
            
            onClose();
        } catch (error) {
            setError('Failed to create channel: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Channel</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Channel Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Hash className="h-4 w-4 inline mr-1" />
                            Channel Name *
                        </label>
                        <input
                            type="text"
                            value={channelData.name}
                            onChange={(e) => setChannelData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., project-alpha, marketing-team"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Use lowercase letters, numbers, and hyphens</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={channelData.description}
                            onChange={(e) => setChannelData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="What's this channel about?"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Channel Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Channel Type</label>
                        <select
                            value={channelData.type}
                            onChange={(e) => setChannelData((prev) => ({ ...prev, type: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {channelTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} - {type.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Privacy Setting */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <Lock className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Private Channel</p>
                                <p className="text-xs text-gray-500">Only invited members can access</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={channelData.isPrivate}
                            onChange={(e) => setChannelData((prev) => ({ ...prev, isPrivate: e.target.checked }))}
                            className="h-4 w-4 text-indigo-600 rounded"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !channelData.name.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Channel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChannel;