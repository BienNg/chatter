// src/App.js - Updated to include OnboardingFlow
import React, { useState } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Main Application Content</p>
        <button 
          onClick={() => setShowOnboarding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Show Onboarding
        </button>
      </header>
    </div>
  );
}

export default App;