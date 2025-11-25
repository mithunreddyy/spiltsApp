"use client";

import dynamic from "next/dynamic";

// Dynamically import the main App component with no SSR
const MoneyTrackerApp = dynamic(() => import("@/components/MoneyTrackerApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-white dark:bg-grid-dark opacity-10" />
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="text-center relative z-10">
        <div className="glass-panel p-12 rounded-3xl text-center animate-pulse">
          <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Money Splits
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Loading your expense tracker...
          </p>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <MoneyTrackerApp />;
}
