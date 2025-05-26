import React, { useState, useRef } from 'react';
import { Bold, Italic, Strikethrough, Link, List, ListOrdered, Indent, Smile, Paperclip, Mic, Send } from 'lucide-react';

const TaskComposer = ({ onSendMessage, placeholder = "Add a comment...", isLoading = false }) => {
    const [content, setContent] = useState('');
    const editorRef = useRef(null);

    const handleSendMessage = () => {
        if (content.trim()) {
            onSendMessage(content);
            setContent('');
            if (editorRef.current) {
                editorRef.current.textContent = '';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInput = (e) => {
        setContent(e.target.textContent);
    };

    const formatText = (command) => {
        // TODO: Implement rich text formatting
        console.log('Format command:', command);
    };

    return (
        <div className="p-4 border-t border-gray-200">
            <div className="border border-gray-200 rounded-lg bg-white">
                {/* Formatting Toolbar */}
                <div className="flex items-center px-3 py-2 border-b border-gray-200 space-x-2">
                    <button 
                        onClick={() => formatText('bold')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Bold"
                    >
                        <Bold className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => formatText('italic')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Italic"
                    >
                        <Italic className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => formatText('strikethrough')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-2"></div>
                    <button 
                        onClick={() => formatText('link')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Link"
                    >
                        <Link className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => formatText('bulletList')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Bullet List"
                    >
                        <List className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => formatText('numberedList')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                        onClick={() => formatText('indent')}
                        className="p-1 rounded hover:bg-gray-100 transition-colors" 
                        title="Indent"
                    >
                        <Indent className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
                
                {/* Message Input Area */}
                <div className="px-3 py-2 min-h-[60px]">
                    <div 
                        ref={editorRef}
                        contentEditable="true" 
                        className="w-full focus:outline-none text-gray-900"
                        data-placeholder={placeholder}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        suppressContentEditableWarning={true}
                        style={{
                            minHeight: '20px'
                        }}
                    />
                </div>
                
                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <button 
                            className="p-1 rounded hover:bg-gray-100 transition-colors" 
                            title="Emoji"
                        >
                            <Smile className="h-4 w-4 text-gray-600" />
                        </button>
                        <button 
                            className="p-1 rounded hover:bg-gray-100 transition-colors" 
                            title="Attach"
                        >
                            <Paperclip className="h-4 w-4 text-gray-600" />
                        </button>
                        <button 
                            className="p-1 rounded hover:bg-gray-100 transition-colors" 
                            title="Voice"
                        >
                            <Mic className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                    <button 
                        onClick={handleSendMessage}
                        disabled={!content.trim() || isLoading}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-white transition-colors ${
                            content.trim() && !isLoading
                                ? 'bg-indigo-600 hover:bg-indigo-700' 
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        title="Send"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskComposer; 