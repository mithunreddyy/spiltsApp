"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Simple encryption for demonstration (NOT production-ready)
const hashPassword = (password: string): string => {
  return btoa(password); // In production, use proper hashing like bcrypt
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useLocalStorage<
    Record<
      string,
      {
        email: string;
        password: string;
        name: string;
        id: string;
        createdAt: string;
      }
    >
  >("money-splits-users", {});
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>(
    "money-splits-current-user",
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const user =
    currentUserId && users[currentUserId]
      ? {
          id: users[currentUserId].id,
          email: users[currentUserId].email,
          name: users[currentUserId].name,
          createdAt: users[currentUserId].createdAt,
        }
      : null;

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validation
      if (!email || !password || !name) {
        return { success: false, error: "All fields are required" };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Invalid email format" };
      }

      // Check if user already exists
      const existingUser = Object.values(users).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      // Create new user
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = hashPassword(password);

      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      setUsers({ ...users, [userId]: newUser });
      setCurrentUserId(userId);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      const user = Object.values(users).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return { success: false, error: "Invalid email or password" };
      }

      setCurrentUserId(user.id);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      if (!currentUserId || !users[currentUserId]) {
        return false;
      }

      if (name.trim().length < 2) {
        return false;
      }

      setUsers({
        ...users,
        [currentUserId]: {
          ...users[currentUserId],
          name: name.trim(),
        },
      });

      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
