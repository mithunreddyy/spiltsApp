import React, { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) => {
  const baseClass =
    "px-6 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200",
    secondary:
      "bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900",
    danger:
      "bg-white dark:bg-black text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  };

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
