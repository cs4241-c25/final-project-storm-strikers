import AuthButton from "@/components/auth/authButton";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B&W Navigator | Brigham and Women's Hospital",
  description:
    "Get help navigating auxiliary ambulatory sites and services managed by Brigham and Women's Hospital. Find drop-off locations, parking, and directories. Brigham and Women's hopsital is a founding member of Mass General Brigham",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} antialiased min-h-screen flex flex-col`}
      >
        <Toaster />
        <header className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={28.6}
                  height={41.1}
                  fill="white"
                >
                  <g className="layer">
                    <path
                      d="M3.8 15.5H0v12.4h3.8zM8.2 15.5v12.4h3.9V15.5zM16.5 15.5v12.4h3.8V15.5zM0 13.1h28.6V9.6H0zM14.3.1 0 4.8v3.7l14.3-4.8 14.3 4.8V4.8zM28.6 27.6c-.1.2-1.5 2.6-10.6 2.6h-7.4C1.2 30.3.2 31.5 0 31.6v3.6c.2-.1 1.2-1.3 10.6-1.4H18c9.1 0 10.5-2.4 10.6-2.6v-3.6zM28.6 33.5c-.1.2-1.5 2.6-10.6 2.6h-7.4C1.2 36.2.2 37.4 0 37.5v3.6c.2-.1 1.2-1.3 10.6-1.4H18c9.1 0 10.5-2.4 10.6-2.6v-3.6zM24.7 15.5v11.8c3.1-.7 3.8-1.8 3.8-2v-9.8h-3.8z"
                      className="st1"
                    />
                  </g>
                </svg>
                <div className="flex flex-col">
                  <h1 className="text-base md:text-xl font-semibold">
                    Brigham and Women&apos;s Hospital
                  </h1>
                  <h2 className="text-xs md:text-sm text-muted">
                    Founding Member, Mass General Brigham
                  </h2>
                </div>
              </div>
            </Link>

            <nav>
              <ul className="flex space-x-4 items-center ">
                {/* <li className="hidden md:block text-md">
                  <Link href="/" className="hover:underline flex items-center">
                    Home
                  </Link>
                </li> */}
                <li>
                  <AuthButton />
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
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
