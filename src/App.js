// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThreadProvider } from './contexts/ThreadContext';
import { Login, OnboardingFlow } from './components/auth';
import { MessagingInterface } from './components/messaging';


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
                            {/* Default redirect to channels */}
                            <Route index element={<Navigate to="/channels" replace />} />
                            
                            {/* Channel routes with nested tab routing */}
                            <Route path="channels" element={<MessagingInterface />}>
                                {/* Default to first channel when no channel selected */}
                                <Route index element={<MessagingInterface />} />
                                
                                {/* Channel with tab routes */}
                                <Route path=":channelId" element={<MessagingInterface />}>
                                    {/* Default to messages tab */}
                                    <Route index element={<Navigate to="messages" replace />} />
                                    
                                    {/* Messages tab with optional thread */}
                                    <Route path="messages" element={<MessagingInterface />} />
                                    <Route path="messages/thread/:messageId" element={<MessagingInterface />} />
                                    
                                    {/* Tasks tab with optional task detail */}
                                    <Route path="tasks" element={<MessagingInterface />} />
                                    <Route path="tasks/:taskId" element={<MessagingInterface />} />
                                    
                                    {/* Classes tab with optional sub-tabs */}
                                    <Route path="classes" element={<MessagingInterface />}>
                                        <Route index element={<Navigate to="overview" replace />} />
                                        <Route path="overview" element={<MessagingInterface />} />
                                        <Route path="info" element={<MessagingInterface />} />
                                    </Route>
                                    
                                    {/* Wiki tab */}
                                    <Route path="wiki" element={<MessagingInterface />} />
                                    <Route path="wiki/:pageId" element={<MessagingInterface />} />
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