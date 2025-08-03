// components/LoadingSpinner.jsx
"use client";

export default function LoadingSpinner({ text = "" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
}
