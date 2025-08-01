import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Horecfex 2025 QR Hunt",
  description: "Mini game săn QR tại Horecfex 2025",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-white">
        <div className="max-w-sm mx-auto bg-white min-h-screen flex flex-col">
          <div className="flex-1 pb-20">{children}</div>
          <BottomNav active="home" />
        </div>
      </body>
    </html>
  );
}
