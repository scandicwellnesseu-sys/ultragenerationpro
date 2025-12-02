
import React, { useEffect, useState } from 'react';
import { CheckIcon, AlertTriangleIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2700); // Slightly less than context timer to allow fade-out
    return () => clearTimeout(timer);
  }, [message, type]);

  const baseClasses = "fixed bottom-5 right-5 flex items-center px-4 py-3 rounded-lg shadow-lg transition-all duration-300";
  const typeClasses = {
    success: "bg-green-800/90 border border-green-600 text-green-100",
    error: "bg-red-800/90 border border-red-600 text-red-100",
  };
  const visibilityClasses = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5";

  const Icon = type === 'success' ? CheckIcon : AlertTriangleIcon;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`} role="alert">
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-semibold">{message}</span>
    </div>
  );
};

export default Toast;
