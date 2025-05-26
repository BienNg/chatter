import React, { useState, useEffect, useRef } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import RichTextEditor from './composition/RichTextEditor';

const MessageEditor = ({ 
    message, 
    onSave, 
    onCancel, 
    isLoading = false,
    maxLength = 4000 
}) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const editorRef = useRef(null);

    // Initialize content from message
    useEffect(() => {
        if (message?.content) {
            setContent(message.content);
        }
    }, [message]);

    // Track changes
    useEffect(() => {
        setHasChanges(content !== (message?.content || ''));
    }, [content, message?.content]);

    // Focus editor on mount
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }, []);

    const handleSave = async () => {
        if (!content.trim()) {
            setError('Message cannot be empty');
            return;
        }

        if (content.length > maxLength) {
            setError(`Message is too long (${content.length}/${maxLength} characters)`);
            return;
        }

        if (!hasChanges) {
            onCancel();
            return;
        }

        try {
            setError('');
            await onSave(content.trim());
        } catch (err) {
            setError(err.message || 'Failed to save message');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    };

    const getCharacterCount = () => {
        // Get text content without HTML tags for accurate count
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        return tempDiv.textContent?.length || 0;
    };

    const characterCount = getCharacterCount();
    const isOverLimit = characterCount > maxLength;

    return (
        <div className="message-editor bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Editor Header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                        Edit message
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className={`text-xs ${
                            isOverLimit ? 'text-red-500' : 'text-gray-500'
                        }`}>
                            {characterCount}/{maxLength}
                        </span>
                    </div>
                </div>
            </div>

            {/* Rich Text Editor */}
            <div className="relative">
                <RichTextEditor
                    ref={editorRef}
                    value={content}
                    onChange={setContent}
                    onKeyDown={handleKeyDown}
                    placeholder="Edit your message..."
                    disabled={isLoading}
                    maxLength={null} // Disable internal character count to avoid duplication
                    className="border-0"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-3 py-2 border-t border-red-200 bg-red-50">
                    <div className="flex items-center space-x-2 text-red-700">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Press Ctrl+Enter to save, Esc to cancel
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading || !hasChanges || isOverLimit || !content.trim()}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-3 w-3" />
                                    <span>Save</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit History Indicator */}
            {message?.editedAt && (
                <div className="px-3 py-1 border-t border-gray-100 bg-gray-25">
                    <span className="text-xs text-gray-400">
                        Last edited {new Date(message.editedAt.toDate()).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default MessageEditor; 