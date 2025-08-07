
import "./globals.css";

export const metadata = {
  title: "Horecfex 2025 QR Hunt",
  description: "Mini game săn QR tại Horecfex 2025",
};

import { Toaster } from 'react-hot-toast';
import { ToastProvider } from "@/context/ToastProvider";

export default function RootLayout({ children }) {

  return (
    <html lang="vi">
      <body className="bg-white">
        <div className="max-w-sm mx-auto bg-white min-h-screen flex flex-col">
          <div className="flex-1 pb-20">
            <ToastProvider>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </ToastProvider>
            </div>
        </div>
      </body>
    </html>
  );
}
