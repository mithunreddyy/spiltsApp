"use client";

import dynamic from "next/dynamic";

// Dynamically import the main App component with no SSR
// This ensures localStorage is only accessed on the client side
const MoneyTrackerApp = dynamic(() => import("@/components/MoneyTrackerApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading Money Splits...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <MoneyTrackerApp />;
}
