// src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import OnboardingFlow from './components/OnboardingFlow';
import MessagingInterface from './components/MessagingInterface';
import './App.css';

function AppContent() {
    const { currentUser, userProfile } = useAuth();

    // Show login if not authenticated
    if (!currentUser) {
        return <Login />;
    }

    // Show onboarding if user hasn't completed it
    if (userProfile && !userProfile.isOnboardingComplete) {
        return <OnboardingFlow />;
    }

    // Show main app
    return <MessagingInterface />;
}

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppContent />
            </div>
        </AuthProvider>
    );
}

export default App;