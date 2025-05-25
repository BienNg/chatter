// src/components/MessagingInterface.jsx
import React, { useState } from 'react';
import MessageListView from './MessageListView';
import ThreadView from './ThreadView';

const MessagingInterface = () => {
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        color: 'bg-blue-500',
        online: true
      },
      content: 'Good morning class! Today we\'ll be focusing on the past perfect tense. Please open your textbooks to page 45.',
      timestamp: '10:23 AM',
      fullTimestamp: 'Today at 10:23 AM',
      reactions: [
        { emoji: '👍', count: 3, users: ['Alex Chen', 'Mai Tran', 'John Doe'] }
      ],
      threadCount: 0
    },
    {
      id: 2,
      user: {
        name: 'Alex Chen',
        avatar: 'AC',
        color: 'bg-green-500',
        online: true
      },
      content: 'I have a question about yesterday\'s homework. Can we review exercise 3?',
      timestamp: '10:25 AM',
      fullTimestamp: 'Today at 10:25 AM',
      reactions: [],
      threadCount: 0
    },
    {
      id: 3,
      user: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        color: 'bg-blue-500',
        online: true
      },
      content: 'Here\'s the worksheet for today\'s exercises: Can everyone please complete exercises 1-5 for homework?',
      timestamp: '10:30 AM',
      fullTimestamp: 'Today at 10:30 AM',
      reactions: [
        { emoji: '❤️', count: 2, users: ['Alex Chen', 'Mai Tran'] },
        { emoji: '👍', count: 1, users: ['John Doe'] }
      ],
      threadCount: 3,
      attachment: {
        type: 'pdf',
        name: 'Past Perfect Exercises.pdf',
        size: '2.3 MB'
      }
    }
  ]);

  const [threadMessages] = useState({
    3: [
      {
        id: 31,
        user: { name: 'Alex Chen', avatar: 'AC', color: 'bg-green-500' },
        content: 'Thanks for sharing! Should we focus on the past perfect section?',
        timestamp: '10:35 AM',
        fullTimestamp: 'Today at 10:35 AM'
      },
      {
        id: 32,
        user: { name: 'Mai Tran', avatar: 'MT', color: 'bg-purple-500' },
        content: 'I have a question about exercise 3. The sentence structure seems different from what we learned last week.',
        timestamp: '10:40 AM',
        fullTimestamp: 'Today at 10:40 AM'
      },
      {
        id: 33,
        user: { name: 'Sarah Johnson', avatar: 'SJ', color: 'bg-blue-500' },
        content: 'Good question, Mai! Exercise 3 introduces the passive voice with past perfect. We\'ll review this in tomorrow\'s class.',
        timestamp: '10:45 AM',
        fullTimestamp: 'Today at 10:45 AM'
      }
    ]
  });

  const handleOpenThread = (messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setActiveThread({
        ...message,
        replies: threadMessages[messageId] || []
      });
    }
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  const handleNewMessage = (newMessage) => {
    const messageData = {
      ...newMessage,
      id: Date.now(),
      user: { name: 'Bien Nguyen', avatar: 'BN', color: 'bg-indigo-500', online: true },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTimestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      reactions: [],
      threadCount: 0
    };
    
    setMessages((prev) => [...prev, messageData]);
  };

  const handleNewThreadReply = (messageId, reply) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, threadCount: msg.threadCount + 1 }
          : msg
      )
    );
    
    // Update active thread if it's open
    if (activeThread && activeThread.id === messageId) {
      const newReply = {
        id: Date.now(),
        user: { name: 'Bien Nguyen', avatar: 'BN', color: 'bg-indigo-500' },
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
      
      setActiveThread((prev) => ({
        ...prev,
        replies: [...prev.replies, newReply]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-indigo-900 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-indigo-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-300 hover:bg-indigo-800 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-300 hover:bg-indigo-800 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6l.5 6h-7L8 7z" />
            </svg>
          </button>
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-300 hover:bg-indigo-800 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">BN</div>
        </div>
      </div>
      
      {/* Channel Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-4 border-b border-indigo-700">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Chatter</h2>
            <button className="text-indigo-300 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="bg-indigo-700 rounded-md flex items-center p-2">
            <svg className="w-4 h-4 text-indigo-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search" className="bg-transparent border-none text-sm text-white placeholder-indigo-300 focus:outline-none w-full" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
              <span className="font-semibold">CHANNELS</span>
              <button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-1">
              <button className="flex items-center py-1 px-2 rounded bg-indigo-600 text-white w-full text-left">
                <span className="text-sm"># general</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># marketing</span>
                <span className="ml-auto bg-indigo-500 text-xs rounded-full px-1.5">2</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># design</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># development</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># product</span>
              </button>
            </div>
          </div>
          
          <div className="px-3 py-2 mt-4">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
              <span className="font-semibold">DIRECT MESSAGES</span>
              <button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-1">
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 w-full text-left">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-indigo-200">Sarah Johnson</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 w-full text-left">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <span className="text-sm text-indigo-200">Alex Chen</span>
                <span className="ml-auto bg-indigo-500 text-xs rounded-full px-1.5">1</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 w-full text-left">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-sm text-indigo-200">Michael Torres</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white transition-all duration-300 ${activeThread ? 'mr-96' : ''}`}>
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-800"># general</h3>
            <span className="ml-2 text-sm text-gray-500">25 members</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 4.343l15.314 15.314M5 5l14 14" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Message List */}
        <MessageListView 
          messages={messages}
          onOpenThread={handleOpenThread}
          onNewMessage={handleNewMessage}
        />
      </div>

      {/* Thread Panel - Conditionally Rendered */}
      {activeThread && (
        <ThreadView 
          message={activeThread}
          replies={activeThread.replies}
          isOpen={true}
          onClose={handleCloseThread}
          onNewReply={handleNewThreadReply}
        />
      )}
    </div>
  );
};

export default MessagingInterface;