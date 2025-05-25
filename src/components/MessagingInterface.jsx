// src/components/MessagingInterface.jsx
import React, { useState } from 'react';
import MessageListView from './MessageListView';
import MessageComposition from './MessageComposition';
import RealTimeUpdates from './RealTimeUpdates';
import ThreadView from './ThreadView';
import CommentComposition from './CommentComposition';
import NestedComments from './NestedComments';

const MessagingInterface = () => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [currentState, setCurrentState] = useState(1);
  const [showThread, setShowThread] = useState(false);

  const screens = {
    1: {
      title: 'Channel Message Interface',
      states: {
        1: { title: 'Message List View', component: MessageListView },
        2: { title: 'Message Composition', component: MessageComposition },
        3: { title: 'Real-Time Updates', component: RealTimeUpdates }
      }
    },
    2: {
      title: 'Comment Threading',
      states: {
        1: { title: 'Thread View', component: ThreadView },
        2: { title: 'Comment Composition', component: CommentComposition },
        3: { title: 'Nested Comments', component: NestedComments }
      }
    }
  };

  const renderCurrentComponent = () => {
    const screen = screens[currentScreen];
    const state = screen.states[currentState];
    const Component = state.component;

    // Special handling for threading components
    if (currentScreen === 2) {
      return (
        <div className="flex h-full">
          {/* Main chat area (reduced width when thread is open) */}
          <div className="flex-1 transition-all duration-300">
            <MessageListView />
          </div>
          {/* Thread panel */}
          <Component 
            isOpen={true} 
            onClose={() => setShowThread(false)}
          />
        </div>
      );
    }

    return <Component />;
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
            <h2 className="font-bold">Channels</h2>
            <button className="text-indigo-300 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="bg-indigo-700 rounded-md flex items-center p-2">
            <svg className="w-4 h-4 text-indigo-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search channels" className="bg-transparent border-none text-sm text-white placeholder-indigo-300 focus:outline-none w-full" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <button className="flex items-center py-1 px-2 rounded bg-indigo-600 text-white w-full text-left">
                <span className="text-sm"># A1.1 Morning Class</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># B2.2 Evening Class</span>
                <span className="ml-auto bg-indigo-500 text-xs rounded-full px-1.5">3</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># Teacher's Lounge</span>
              </button>
              <button className="flex items-center py-1 px-2 rounded hover:bg-indigo-700 text-indigo-200 w-full text-left">
                <span className="text-sm"># Admin Team</span>
              </button>
            </div>
          </div>
          
          <div className="px-3 py-2 mt-4">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
              <span className="font-semibold">DIRECT MESSAGES</span>
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-800">#G38</h3>
            <span className="ml-2 text-sm text-gray-500">5 members</span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">Messages</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Classes</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Tasks</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Wiki</button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Dynamic Content */}
        {renderCurrentComponent()}
      </div>

      {/* Floating Screen Navigation - Bottom Right */}
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Screen Navigation</h4>
          <div className="flex space-x-2">
            {Object.entries(screens).map(([screenNum, screen]) => (
              <button
                key={screenNum}
                onClick={() => {
                  setCurrentScreen(parseInt(screenNum));
                  setCurrentState(1);
                  if (screenNum === '2') setShowThread(true);
                }}
                className={`w-8 h-8 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  currentScreen === parseInt(screenNum)
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105'
                }`}
                title={`Screen ${screenNum}: ${screen.title}`}
              >
                {screenNum}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">States</h5>
          <div className="flex space-x-1">
            {Object.entries(screens[currentScreen].states).map(([stateNum, state]) => (
              <button
                key={stateNum}
                onClick={() => setCurrentState(parseInt(stateNum))}
                className={`w-6 h-6 rounded-md text-xs font-medium transition-all duration-200 ${
                  currentState === parseInt(stateNum)
                    ? 'bg-indigo-500 text-white shadow-md transform scale-110'
                    : 'bg-gray-200 text-gray-500 hover:bg-indigo-200 hover:text-indigo-600 hover:scale-110'
                }`}
                title={`State ${stateNum}: ${state.title}`}
              >
                {stateNum}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingInterface;