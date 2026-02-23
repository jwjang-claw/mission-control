"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
  return (
    <MainLayout title="Task Board" subtitle="Manage your tasks and projects">
      <TaskBoard />
    </MainLayout>
  );
}
