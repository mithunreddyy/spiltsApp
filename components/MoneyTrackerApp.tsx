"use client";

import { LoginPage } from "@/components/AuthPages";
import Dashboard from "@/components/Dashboard";
import ErrorBoundary from "@/components/ErrorBoundary";
import FloatingActions from "@/components/FloatingActions";
import GroupDetail from "@/components/GroupDetail";
import { ToastProvider } from "@/components/Toast";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";

const AppContent: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { darkMode, lastError, clearError } = useApp();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Apply dark mode class to html element
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [darkMode]);

  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError, clearError]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-grid-white dark:bg-grid-dark opacity-10" />
        <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />

        <div className="text-center relative z-10">
          <div className="glass-panel p-8 rounded-2xl animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Loading Money Splits...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <FloatingActions />

      {selectedGroupId ? (
        <GroupDetail
          groupId={selectedGroupId}
          onBack={() => setSelectedGroupId(null)}
        />
      ) : (
        <Dashboard onSelectGroup={setSelectedGroupId} />
      )}
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppProvider userId={user?.id}>
      <AppContent />
    </AppProvider>
  );
};

export default function MoneyTrackerApp() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AuthGuard />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-grid-white dark:bg-grid-dark opacity-10" />
        <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />

        <div className="text-center relative z-10">
          <div className="glass-panel p-8 rounded-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Getting things ready...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};
