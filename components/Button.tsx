import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-sm flex items-center justify-center";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 border border-white/10",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md", 
    danger: "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 shadow-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};