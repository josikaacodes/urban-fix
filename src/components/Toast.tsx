import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1a3125] text-white px-4 py-3 rounded-lg shadow-xl border border-[#4c6451]/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 text-xs font-body max-w-md">
      <span className="material-symbols-outlined text-[#cee9d1] text-[20px]">
        info
      </span>
      <span className="font-medium text-white">{message}</span>
    </div>
  );
};
