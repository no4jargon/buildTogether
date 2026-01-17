'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

type ToastMessage = {
  id: number;
  message: string;
};

type ToastContextValue = {
  toast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message }
    ]);
    setTimeout(() => {
      setMessages((prev) => prev.slice(1));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 shadow-lg"
          >
            {msg.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
