// src/App.js - Clean full-screen version
import React, { useState } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import MessagingInterface from './components/MessagingInterface';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('messaging');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingFlow onComplete={() => setCurrentView('messaging')} />;
      case 'messaging':
        return <MessagingInterface />;
      default:
        return <MessagingInterface />;
    }
  };

  return (
    <div className="App">
      {/* View Toggle - Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex space-x-1">
          <button
            onClick={() => setCurrentView('onboarding')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'onboarding'
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105'
              }`}
          >
            Onboarding
          </button>
          <button
            onClick={() => setCurrentView('messaging')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === 'messaging'
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105'
              }`}
          >
            Messaging
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen">
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;