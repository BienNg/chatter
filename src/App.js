// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThreadProvider } from './contexts/ThreadContext';
import { Login, OnboardingFlow } from './components/auth';
import { MessagingInterface } from './components/messaging';
import './App.css';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const { currentUser, userProfile } = useAuth();
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userProfile && !userProfile.isOnboardingComplete) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

// Public Route wrapper component (redirects if already authenticated)
const PublicRoute = ({ children }) => {
    const { currentUser, userProfile } = useAuth();
    
    if (currentUser) {
        if (userProfile && !userProfile.isOnboardingComplete) {
            return <Navigate to="/onboarding" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

// Onboarding Route wrapper component
const OnboardingRoute = ({ children }) => {
    const { currentUser, userProfile } = useAuth();
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userProfile && userProfile.isOnboardingComplete) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route 
                            path="/login" 
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } 
                        />

                        {/* Onboarding Route */}
                        <Route 
                            path="/onboarding" 
                            element={
                                <OnboardingRoute>
                                    <OnboardingFlow />
                                </OnboardingRoute>
                            } 
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <ThreadProvider>
                                        <MessagingInterface />
                                    </ThreadProvider>
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/channels" replace />} />
                            <Route path="channels" element={<MessagingInterface />}>
                                <Route path=":channelId" element={<MessagingInterface />}>
                                    <Route path="messages/:messageId" element={<MessagingInterface />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;