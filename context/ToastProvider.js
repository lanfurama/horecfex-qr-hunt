"use client";
import { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const triggerToast = useCallback((message, type = "default") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.loading(message);
        break;
      default:
        toast(message);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
