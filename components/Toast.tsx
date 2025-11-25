"use client";

import {
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastType = "success" | "error" | "warning" | "info" | "premium";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  premium: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const success = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const error = useCallback(
    (message: string) => showToast(message, "error", 6000),
    [showToast]
  );
  const warning = useCallback(
    (message: string) => showToast(message, "warning", 5000),
    [showToast]
  );
  const info = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );
  const premium = useCallback(
    (message: string) => showToast(message, "premium"),
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-500`} />;
      case "warning":
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-500`} />;
      case "premium":
        return <Sparkles className={`${iconClass} text-purple-500`} />;
    }
  };

  const getStyles = (type: ToastType) => {
    const baseStyles = "backdrop-blur-md border shadow-2xl";
    switch (type) {
      case "success":
        return `${baseStyles} bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300`;
      case "error":
        return `${baseStyles} bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300`;
      case "warning":
        return `${baseStyles} bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300`;
      case "info":
        return `${baseStyles} bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300`;
      case "premium":
        return `${baseStyles} bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300`;
    }
  };

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, warning, info, premium }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-3 max-w-md w-full px-4">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`
              ${getStyles(toast.type)}
              rounded-2xl p-4 animate-slide-up
              transition-all duration-500
              flex items-start gap-3
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * 10}px)`,
            }}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <p className="flex-1 text-sm font-medium leading-5">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-current/60 hover:text-current/100 transition-colors rounded-lg hover:bg-current/10"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
