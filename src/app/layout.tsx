import AuthButton from "@/components/auth/authButton";
import { Toaster } from "@/components/ui/sonner";
import AuthButton from "@/components/auth/authButton";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <Toaster />
        <header className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full" />
              <h1 className="text-2xl font-bold">Mass General Brigham</h1>
            </div>
            <nav>
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link
                    href="/"
                    className="hover:underline text-xl flex items-center"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <AuthButton />
                </li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Mass General Brigham. All rights reserved.</p>
            <p>For emergencies, please call 911</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
