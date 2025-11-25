"use client";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { exportAllGroupsAsJSON } from "@/lib/utils";
import {
  Download,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import React, { useState } from "react";

const FloatingActions: React.FC = () => {
  const { darkMode, toggleDarkMode, groups } = useApp();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <div className="fixed top-6 right-6 z-40 flex gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="glass-button p-3 rounded-xl hover:scale-110 transition-all duration-300 group"
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600 group-hover:text-blue-500 transition-colors" />
          )}
        </button>

        {/* Export Data */}
        {groups.length > 0 && (
          <button
            onClick={() => exportAllGroupsAsJSON(groups)}
            className="glass-button p-3 rounded-xl hover:scale-110 transition-all duration-300 group"
            aria-label="Export all data"
            title="Export all groups as JSON"
          >
            <Download className="w-5 h-5 text-green-600 group-hover:text-green-500 transition-colors" />
          </button>
        )}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="glass-button p-3 rounded-xl hover:scale-110 transition-all duration-300 group flex items-center gap-2"
            aria-label="User menu"
            title={user?.name || "User menu"}
          >
            <User className="w-5 h-5 text-purple-600 group-hover:text-purple-500 transition-colors" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/20 animate-scale-in origin-top-right">
              {/* User Info */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                      {user?.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Settings className="w-4 h-4" />
                  Member since{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).getFullYear()
                    : "2024"}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {groups.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Groups
                    </div>
                  </div>
                  <div className="glass-card p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {groups.reduce(
                        (total, group) => total + group.expenses.length,
                        0
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Expenses
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 dark:hover:bg-black/10 transition-colors duration-300 flex items-center gap-3 text-gray-700 dark:text-gray-200 rounded-lg group"
                >
                  <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400 transition-colors" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default FloatingActions;
