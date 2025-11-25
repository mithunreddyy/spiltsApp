"use client";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { exportAllGroupsAsJSON } from "@/lib/utils";
import { Download, LogOut, Moon, Sun, User } from "lucide-react";
import React, { useState } from "react";

const FloatingActions: React.FC = () => {
  const { darkMode, toggleDarkMode, groups } = useApp();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <div className="fixed top-6 right-6 z-40 flex gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-black dark:text-white" />
          ) : (
            <Moon className="w-5 h-5 text-black dark:text-white" />
          )}
        </button>

        {groups.length > 0 && (
          <button
            onClick={() => exportAllGroupsAsJSON(groups)}
            className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            aria-label="Export all data"
            title="Export all groups as JSON"
          >
            <Download className="w-5 h-5 text-black dark:text-white" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            aria-label="User menu"
            title={user?.name || "User menu"}
          >
            <User className="w-5 h-5 text-black dark:text-white" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black border-2 border-black dark:border-white">
              <div className="p-4 border-b-2 border-black dark:border-white">
                <p className="font-medium text-black dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 text-black dark:text-white"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
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
