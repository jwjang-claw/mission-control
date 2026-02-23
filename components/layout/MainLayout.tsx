"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MainLayout = ({
  children,
  title,
  subtitle,
}: MainLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {title && <Header title={title} subtitle={subtitle} />}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
};
