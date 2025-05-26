import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Link
} from 'lucide-react';

const RichTextEditor = forwardRef(({ 
    value = '', 
    onChange, 
    placeholder = 'Type your message...', 
    onKeyDown,
    className = '',
    disabled = false,
    isDraftSaved = false
}, ref) => {
    const editorRef = useRef(null);
    const [selection, setSelection] = useState(null);
    const [activeFormats, setActiveFormats] = useState(new Set());

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        focus: () => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        },
        clear: () => {
            if (editorRef.current) {
                // Mark as internal update to prevent triggering onChange
                isInternalUpdate.current = true;
                editorRef.current.innerHTML = '';
                // Don't call onChange here - let the parent handle state updates
            }
        },
        getContent: () => {
            return editorRef.current?.innerHTML || '';
        }
    }), [onChange]);

    // Initialize editor content (only on mount, not on every value change)
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, []); // Only run on mount

    // Separate effect for external value updates (like loading drafts or clearing)
    const isInternalUpdate = useRef(false);
    useEffect(() => {
        if (editorRef.current && !isInternalUpdate.current) {
            const currentContent = editorRef.current.innerHTML;
            const normalizedValue = value || '';
            const normalizedCurrent = currentContent || '';
            
            // Update if values are different (including empty string clearing)
            if (normalizedValue !== normalizedCurrent) {
                // Save cursor position
                const selection = window.getSelection();
                let cursorPosition = 0;
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    cursorPosition = range.startOffset;
                }
                
                editorRef.current.innerHTML = normalizedValue;
                
                // Restore cursor position (only if there's content)
                if (cursorPosition > 0 && normalizedValue && editorRef.current.firstChild) {
                    try {
                        const range = document.createRange();
                        const textNode = editorRef.current.firstChild;
                        const maxOffset = textNode.textContent?.length || 0;
                        range.setStart(textNode, Math.min(cursorPosition, maxOffset));
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (error) {
                        // Ignore cursor restoration errors
                        console.debug('Could not restore cursor position:', error);
                    }
                }
            }
        }
        isInternalUpdate.current = false;
    }, [value]);

    // Track selection and active formats
    const updateSelection = useCallback(() => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            setSelection(sel.getRangeAt(0));
            
            // Check active formats
            const formats = new Set();
            if (document.queryCommandState('bold')) formats.add('bold');
            if (document.queryCommandState('italic')) formats.add('italic');
            if (document.queryCommandState('underline')) formats.add('underline');
            if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
            if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');
            if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
            
            setActiveFormats(formats);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('selectionchange', updateSelection);
        return () => document.removeEventListener('selectionchange', updateSelection);
    }, [updateSelection]);

    const handleInput = (e) => {
        isInternalUpdate.current = true;
        const content = e.target.innerHTML;
        onChange?.(content);
        updateSelection();
    };

    const handleKeyDown = (e) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
                default:
                    break;
            }
        }
        
        onKeyDown?.(e);
    };

    const execCommand = (command, value = null) => {
        if (disabled) return;
        
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        updateSelection();
        
        // Trigger onChange after command execution
        setTimeout(() => {
            if (editorRef.current) {
                onChange?.(editorRef.current.innerHTML);
            }
        }, 0);
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const formatButtons = [
        { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)', active: 'bold' },
        { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)', active: 'italic' },
        { command: 'underline', icon: Underline, title: 'Underline (Ctrl+U)', active: 'underline' },
        { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough', active: 'strikethrough' },
        { type: 'separator' },
        { command: 'insertUnorderedList', icon: List, title: 'Bullet List', active: 'unorderedList' },
        { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List', active: 'orderedList' },
        { command: 'formatBlock', value: 'blockquote', icon: Quote, title: 'Quote' },
        { type: 'separator' },
        { command: 'createLink', icon: Link, title: 'Insert Link', handler: insertLink },
    ];

    return (
        <div className={`rich-text-editor ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                <div className="flex items-center gap-1">
                    {formatButtons.map((button, index) => {
                    if (button.type === 'separator') {
                        return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
                    }

                    const Icon = button.icon;
                    const isActive = button.active && activeFormats.has(button.active);

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={disabled}
                            className={`p-1.5 rounded-md transition-colors ${
                                isActive
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={button.title}
                            onClick={() => {
                                if (button.handler) {
                                    button.handler();
                                } else {
                                    execCommand(button.command, button.value);
                                }
                            }}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
                </div>
                
                {/* Draft indicator */}
                <div>
                    {isDraftSaved && (
                        <div className="flex items-center text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                            Draft saved
                        </div>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable={!disabled}
                className={`min-h-[100px] max-h-[300px] p-3 focus:outline-none overflow-y-auto text-left ${
                    disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    textAlign: 'left'
                }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                suppressContentEditableWarning={true}
            />

            {/* Character count removed */}

            <style jsx>{`
                .rich-text-editor [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9CA3AF;
                    pointer-events: none;
                }
                
                .rich-text-editor blockquote {
                    border-left: 4px solid #E5E7EB;
                    padding-left: 16px;
                    margin: 8px 0;
                    color: #6B7280;
                    font-style: italic;
                }
                
                .rich-text-editor ul, .rich-text-editor ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .rich-text-editor li {
                    margin: 4px 0;
                }
                
                .rich-text-editor a {
                    color: #6366F1;
                    text-decoration: underline;
                }
                
                .rich-text-editor strong {
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
});

export default RichTextEditor; 