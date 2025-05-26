// src/components/MessageComposition.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Smile,
    AtSign,
    Paperclip,
    X,
    Upload,
    Send
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useDrafts } from '../../../hooks/useDrafts';

const MessageComposition = ({ onSendMessage, channelId, threadId = null, placeholder }) => {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [mentionSuggestions, setMentionSuggestions] = useState([]);
    const fileInputRef = useRef(null);
    const richEditorRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);

    const { getDraft, saveDraft, clearDraft, hasDraft } = useDrafts();

    const users = [
        { id: 1, name: 'Sarah Johnson', avatar: 'SJ' },
        { id: 2, name: 'Alex Chen', avatar: 'AC' },
        { id: 3, name: 'Mai Tran', avatar: 'MT' },
        { id: 4, name: 'John Doe', avatar: 'JD' }
    ];

    const commonEmojis = ['😀', '😊', '👍', '❤️', '😂', '🎉', '👏', '🔥'];

    // Load draft on mount or channel/thread change
    useEffect(() => {
        if (channelId) {
            const draft = getDraft(channelId, threadId);
            if (draft) {
                setMessage(draft.content || '');
                setAttachedFiles(draft.attachments || []);
                // Always use rich text mode
            } else {
                setMessage('');
                setAttachedFiles([]);
            }
        }
    }, [channelId, threadId, getDraft]);

    // Auto-save draft with debouncing - memoized to prevent infinite loops
    const autoSaveDraft = useCallback(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            if (channelId && (message.trim() || attachedFiles.length > 0)) {
                saveDraft(channelId, message, attachedFiles, threadId);
            }
        }, 1000);
    }, [channelId, threadId, saveDraft]); // Removed message and attachedFiles to prevent infinite loops

    // Trigger auto-save when content changes
    useEffect(() => {
        if (channelId && (message.trim() || attachedFiles.length > 0)) {
            autoSaveDraft();
        }
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [message, attachedFiles, autoSaveDraft]);

    const handleSend = () => {
        if (message.trim() || attachedFiles.length > 0) {
            onSendMessage?.({
                content: message.trim() || '[File attachment]',
                attachments: attachedFiles
            });
            
            // Clear draft after sending
            if (channelId) {
                clearDraft(channelId, threadId);
            }
            
            setMessage('');
            setAttachedFiles([]);
            
            // Clear the rich text editor
            if (richEditorRef.current) {
                richEditorRef.current.innerHTML = '';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setIsUploading(true);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadProgress(0);
                setAttachedFiles((prev) => [...prev, ...files.map((file) => ({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    type: file.type
                }))]);
            }
        }, 100);
    };

    const removeFile = (fileId) => {
        setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    const handleMention = (text) => {
        if (text.includes('@')) {
            const query = text.split('@').pop().toLowerCase();
            const suggestions = users.filter((user) =>
                user.name.toLowerCase().includes(query)
            );
            setMentionSuggestions(suggestions);
        } else {
            setMentionSuggestions([]);
        }
    };

    const insertEmoji = (emoji) => {
        const currentEditor = richEditorRef.current;
        if (currentEditor) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(emoji));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                const newContent = currentEditor.innerHTML;
                setMessage(newContent);
            } else {
                // If no selection, append to end
                setMessage(prev => prev + emoji);
            }
            setShowEmojiPicker(false);
            currentEditor.focus();
        }
    };

    // Always use rich text

    const currentPlaceholder = placeholder || (threadId ? 'Reply to thread...' : `Message #${channelId || 'general'}`);
    const isDraftSaved = channelId && hasDraft(channelId, threadId);

    return (
        <div className="p-4 bg-white">
            <div className="message-input border border-gray-200 rounded-lg bg-white focus-within:border-indigo-500 focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)]">
                {/* Rich text editor will have its own toolbar */}

                {/* File Attachments */}
                {attachedFiles.length > 0 && (
                    <div className="px-3 py-2 border-b border-gray-200">
                        <div className="space-y-2">
                            {attachedFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                                            <Paperclip className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">{file.size}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                    <div className="px-3 py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Upload className="h-4 w-4 text-indigo-600" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Input Area */}
                <div className="relative">
                    <RichTextEditor
                        ref={richEditorRef}
                        value={message}
                        onChange={(content) => {
                            setMessage(content);
                            handleMention(content);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={currentPlaceholder}
                        className="border-0"
                        isDraftSaved={isDraftSaved}
                    />

                    {/* Mention Suggestions */}
                    {mentionSuggestions.length > 0 && (
                        <div className="absolute bottom-full left-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs">
                            {mentionSuggestions.map((user) => (
                                <button
                                    key={user.id}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                                    onClick={() => {
                                        setMentionSuggestions([]);
                                    }}
                                >
                                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {user.avatar}
                                    </div>
                                    <span className="text-sm text-gray-900">{user.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Toolbar */}
                <div className="flex items-center px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button
                                className="toolbar-button p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                                title="Emoji"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="h-4 w-4" />
                            </button>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                    <div className="grid grid-cols-4 gap-2">
                                        {commonEmojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                className="p-2 hover:bg-gray-100 rounded text-lg"
                                                onClick={() => insertEmoji(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="toolbar-button p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200" title="Mention">
                            <AtSign className="h-4 w-4" />
                        </button>
                        <button
                            className="toolbar-button p-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                            title="Attach File"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="ml-auto flex items-center space-x-2">
                        <button 
                            onClick={handleSend}
                            disabled={!message.trim() && attachedFiles.length === 0}
                            className={`p-2 rounded-lg transition ${
                                message.trim() || attachedFiles.length > 0
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            title="Send message"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Draft Indicator */}
            <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                {isDraftSaved && (
                    <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Draft saved
                    </span>
                )}
                <span>Enter to send, Shift+Enter for new line</span>
            </div>
        </div>
    );
};

export default MessageComposition;