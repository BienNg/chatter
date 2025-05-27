import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Link,
    Indent,
    Outdent,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Code,
    Type
} from 'lucide-react';

const RichTextEditor = forwardRef(({ 
    value = '', 
    onChange, 
    placeholder = 'Type your message...', 
    onKeyDown,
    className = '',
    disabled = false,
    isDraftSaved = false,
    showAdvancedToolbar = true
}, ref) => {
    const editorRef = useRef(null);
    const [selection, setSelection] = useState(null);
    const [activeFormats, setActiveFormats] = useState(new Set());
    const [showAdvanced, setShowAdvanced] = useState(false);

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
        },
        insertText: (text) => {
            if (editorRef.current) {
                editorRef.current.focus();
                document.execCommand('insertText', false, text);
                onChange?.(editorRef.current.innerHTML);
            }
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
            
            // Better list detection
            const parentElement = sel.anchorNode?.parentElement;
            const listParent = parentElement?.closest('ul, ol');
            if (listParent) {
                if (listParent.tagName === 'UL') {
                    formats.add('unorderedList');
                } else if (listParent.tagName === 'OL') {
                    formats.add('orderedList');
                }
            }
            
            if (document.queryCommandState('justifyLeft')) formats.add('alignLeft');
            if (document.queryCommandState('justifyCenter')) formats.add('alignCenter');
            if (document.queryCommandState('justifyRight')) formats.add('alignRight');
            
            // Check for code formatting
            if (parentElement?.tagName === 'CODE' || parentElement?.closest('code')) {
                formats.add('code');
            }
            
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
                case 'k':
                    e.preventDefault();
                    insertLink();
                    break;
                case '`':
                    e.preventDefault();
                    toggleCode();
                    break;
                default:
                    break;
            }
        }
        
        // Handle Tab for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                execCommand('outdent');
            } else {
                execCommand('indent');
            }
        }
        
        // Handle Enter key in lists
        if (e.key === 'Enter' && !e.shiftKey) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const parentElement = selection.anchorNode?.parentElement;
                const listItem = parentElement?.closest('li');
                
                if (listItem) {
                    // Check if the current list item is empty
                    const listItemText = listItem.textContent?.trim();
                    if (!listItemText) {
                        // Exit the list if the current item is empty
                        e.preventDefault();
                        const listParent = listItem.closest('ul, ol');
                        if (listParent) {
                            if (listParent.tagName === 'UL') {
                                execCommand('insertUnorderedList');
                            } else {
                                execCommand('insertOrderedList');
                            }
                        }
                        return;
                    }
                }
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
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        const url = prompt('Enter URL:', 'https://');
        if (url && url !== 'https://') {
            if (selectedText) {
                execCommand('createLink', url);
            } else {
                const linkText = prompt('Enter link text:', url);
                if (linkText) {
                    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                    execCommand('insertHTML', linkHtml);
                }
            }
        }
    };

    const toggleCode = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            if (selectedText) {
                const codeHtml = `<code class="inline-code">${selectedText}</code>`;
                range.deleteContents();
                range.insertNode(range.createContextualFragment(codeHtml));
                selection.removeAllRanges();
                onChange?.(editorRef.current.innerHTML);
            }
        }
    };

    const insertCodeBlock = () => {
        const codeHtml = `<pre><code class="code-block">// Your code here</code></pre>`;
        execCommand('insertHTML', codeHtml);
    };

    const clearFormatting = () => {
        execCommand('removeFormat');
    };

    const toggleList = (listType) => {
        if (disabled) return;
        
        editorRef.current?.focus();
        
        // Get current selection
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const parentElement = selection.anchorNode?.parentElement;
        const listParent = parentElement?.closest('ul, ol');
        
        if (listParent) {
            // We're in a list, toggle it off
            document.execCommand(listType, false, null);
        } else {
            // We're not in a list, create one
            document.execCommand(listType, false, null);
        }
        
        updateSelection();
        
        // Trigger onChange after command execution
        setTimeout(() => {
            if (editorRef.current) {
                onChange?.(editorRef.current.innerHTML);
            }
        }, 0);
    };

    const basicFormatButtons = [
        { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)', active: 'bold' },
        { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)', active: 'italic' },
        { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough', active: 'strikethrough' },
        { type: 'separator' },
        { command: 'insertUnorderedList', icon: List, title: 'Bullet List', active: 'unorderedList', handler: () => toggleList('insertUnorderedList') },
        { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List', active: 'orderedList', handler: () => toggleList('insertOrderedList') },
        { type: 'separator' },
        { command: 'createLink', icon: Link, title: 'Insert Link (Ctrl+K)', handler: insertLink },
    ];

    const advancedFormatButtons = [
        { command: 'underline', icon: Underline, title: 'Underline (Ctrl+U)', active: 'underline' },
        { command: 'formatBlock', value: 'blockquote', icon: Quote, title: 'Quote' },
        { command: 'code', icon: Code, title: 'Inline Code (Ctrl+`)', handler: toggleCode, active: 'code' },
        { type: 'separator' },
        { command: 'indent', icon: Indent, title: 'Increase Indent (Tab)' },
        { command: 'outdent', icon: Outdent, title: 'Decrease Indent (Shift+Tab)' },
        { type: 'separator' },
        { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left', active: 'alignLeft' },
        { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center', active: 'alignCenter' },
        { command: 'justifyRight', icon: AlignRight, title: 'Align Right', active: 'alignRight' },
        { type: 'separator' },
        { command: 'removeFormat', icon: Type, title: 'Clear Formatting', handler: clearFormatting },
    ];

    const renderToolbarButtons = (buttons) => {
        return buttons.map((button, index) => {
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
        });
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            {/* Toolbar */}
            <div className="border-b border-gray-200">
                {/* Basic Toolbar */}
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-1">
                        {renderToolbarButtons(basicFormatButtons)}
                        
                        {showAdvancedToolbar && (
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="ml-2 p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                title="More formatting options"
                            >
                                <Type className="h-4 w-4" />
                            </button>
                        )}
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

                {/* Advanced Toolbar */}
                {showAdvanced && showAdvancedToolbar && (
                    <div className="flex items-center gap-1 p-2 pt-0 border-t border-gray-100">
                        {renderToolbarButtons(advancedFormatButtons)}
                    </div>
                )}
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
                    list-style-position: outside;
                }
                
                .rich-text-editor ul {
                    list-style-type: disc;
                }
                
                .rich-text-editor ol {
                    list-style-type: decimal;
                }
                
                .rich-text-editor li {
                    margin: 4px 0;
                    display: list-item;
                }
                
                .rich-text-editor a {
                    color: #6366F1;
                    text-decoration: underline;
                }
                
                .rich-text-editor strong {
                    font-weight: 600;
                }
                
                .rich-text-editor .inline-code {
                    background-color: #F3F4F6;
                    color: #EF4444;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.875em;
                }
                
                .rich-text-editor .code-block {
                    background-color: #F9FAFB;
                    color: #374151;
                    padding: 12px;
                    border-radius: 6px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.875em;
                    display: block;
                    white-space: pre;
                    overflow-x: auto;
                    border: 1px solid #E5E7EB;
                }
                
                .rich-text-editor pre {
                    margin: 8px 0;
                }
                
                /* Indentation styles */
                .rich-text-editor [style*="margin-left"] {
                    margin-left: 40px !important;
                }
                
                /* Text alignment */
                .rich-text-editor [style*="text-align: center"] {
                    text-align: center;
                }
                
                .rich-text-editor [style*="text-align: right"] {
                    text-align: right;
                }
                
                .rich-text-editor [style*="text-align: left"] {
                    text-align: left;
                }
            `}</style>
        </div>
    );
});

export default RichTextEditor; 