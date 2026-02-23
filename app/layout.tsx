import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quest Board - Medieval Task Management",
  description: "Manage your noble quests and adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${crimsonText.variable} antialiased`}
      >
        <ConvexClientProvider>
          <div className="tavern-bg" />
          <div className="stone-wall" />
          <div className="torch-glow left" />
          <div className="torch-glow right" />
          <div className="parchment-texture" />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
