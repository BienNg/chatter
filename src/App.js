// src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login, OnboardingFlow } from './components/auth';
import { MessagingInterface } from './components/messaging';
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