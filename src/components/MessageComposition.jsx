// src/components/MessageComposition.jsx
import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Link, 
  List, 
  ListOrdered, 
  Indent,
  Smile,
  AtSign,
  Paperclip,
  Mic,
  Camera,
  CornerDownLeft,
  X,
  Upload
} from 'lucide-react';

const MessageComposition = () => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const users = [
    { id: 1, name: 'Sarah Johnson', avatar: 'SJ' },
    { id: 2, name: 'Alex Chen', avatar: 'AC' },
    { id: 3, name: 'Mai Tran', avatar: 'MT' },
    { id: 4, name: 'John Doe', avatar: 'JD' }
  ];

  const commonEmojis = ['😀', '😊', '👍', '❤️', '😂', '🎉', '👏', '🔥'];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        setAttachedFiles(prev => [...prev, ...files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          type: file.type
        }))]);
      }
    }, 100);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleMention = (text) => {
    if (text.includes('@')) {
      const query = text.split('@').pop().toLowerCase();
      const suggestions = users.filter(user => 
        user.name.toLowerCase().includes(query)
      );
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  };

  return (
    <div className="p-4">
      <div className="message-input">
        {/* Formatting Toolbar */}
        <div className="flex items-center px-3 py-2 border-b border-gray-200 space-x-2">
          <button className="toolbar-button" title="Bold">
            <Bold className="h-4 w-4" />
          </button>
          <button className="toolbar-button" title="Italic">
            <Italic className="h-4 w-4" />
          </button>
          <button className="toolbar-button" title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          <button className="toolbar-button" title="Link">
            <Link className="h-4 w-4" />
          </button>
          <button className="toolbar-button" title="Bullet List">
            <List className="h-4 w-4" />
          </button>
          <button className="toolbar-button" title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button className="toolbar-button" title="Indent">
            <Indent className="h-4 w-4" />
          </button>
        </div>

        {/* File Attachments */}
        {attachedFiles.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="space-y-2">
              {attachedFiles.map(file => (
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
        <div className="px-3 py-2 min-h-[60px] relative">
          <div 
            ref={editorRef}
            contentEditable="true" 
            className="w-full focus:outline-none min-h-[24px]" 
            placeholder="Message #import-s-hai-duong-minh-thu-"
            onInput={(e) => {
              setMessage(e.target.textContent);
              handleMention(e.target.textContent);
            }}
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          />

          {/* Mention Suggestions */}
          {mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs">
              {mentionSuggestions.map(user => (
                <button
                  key={user.id}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  onClick={() => {
                    // Handle mention insertion
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
                className="toolbar-button" 
                title="Emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </button>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        className="p-2 hover:bg-gray-100 rounded text-lg"
                        onClick={() => {
                          // Handle emoji insertion
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button className="toolbar-button" title="Mention">
              <AtSign className="h-4 w-4" />
            </button>
            <button 
              className="toolbar-button" 
              title="Attach File"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="toolbar-button" title="Record">
              <Mic className="h-4 w-4" />
            </button>
            <button className="toolbar-button" title="Screenshot">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <button className="ml-auto text-gray-400">
            <CornerDownLeft className="h-5 w-5" />
          </button>
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
      <div className="mt-2 text-xs text-gray-500">
        Draft saved • Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageComposition;