import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import LeaderboardPage from './pages/LeaderboardPage';
import ApplyPage from './pages/ApplyPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-base-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<LeaderboardPage />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
