import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

export const metadata: Metadata = {
  title: "Mission Control - Task Management",
  description: "Manage your tasks and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
