"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";

// 주간 날짜 계산
function getWeekDates(date: Date): Date[] {
  const dates: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // 일요일부터 시작

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// 시간 포맷팅
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

// 요일 이름
function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

// 이벤트 색상
function getEventColor(eventType?: string): string {
  switch (eventType) {
    case "brief":
      return "bg-amber-500/20 border-amber-500 text-amber-200";
    case "reminder":
      return "bg-emerald-500/20 border-emerald-500 text-emerald-200";
    case "cron":
      return "bg-violet-500/20 border-violet-500 text-violet-200";
    default:
      return "bg-gray-500/20 border-gray-500 text-gray-200";
  }
}

// Next Up 아이템
function NextUpItem({
  task,
  scheduledAt,
}: {
  task: { _id: string; title: string };
  scheduledAt: number;
}) {
  const scheduledDate = new Date(scheduledAt);
  const formattedTime = scheduledDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  });

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{task.title}</span>
      <span className="text-white/40">{formattedTime}</span>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // 주간 범위 계산
  const weekRange = useMemo(
    () => ({
      start: weekDates[0].getTime(),
      end: weekDates[6].getTime() + 24 * 60 * 60 * 1000,
    }),
    [weekDates]
  );

  // 예정된 작업 조회
  const scheduledTasks =
    useQuery(api.scheduled.listScheduled, {
      startTime: weekRange.start,
      endTime: weekRange.end,
    }) || [];
  const upcomingTasks =
    useQuery(api.scheduled.listUpcoming, { limit: 5 }) || [];

  // 반복 작업 조회
  const recurringTasks = useQuery(api.scheduled.listRecurring) || [];

  // 이번 주 작업 필터링
  const thisWeekTasks = scheduledTasks.filter((t) => {
    if (!t.scheduledAt) return false;
    return t.scheduledAt >= weekRange.start && t.scheduledAt < weekRange.end;
  });

  // 날짜별로 그룹화
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof scheduledTasks> = {};
    weekDates.forEach((d) => {
      map[d.toDateString()] = [];
    });
    thisWeekTasks.forEach((task) => {
      if (task.scheduledAt) {
        const dateStr = new Date(task.scheduledAt).toDateString();
        if (map[dateStr]) {
          map[dateStr].push(task);
        }
      }
    });
    return map;
  }, [weekDates, thisWeekTasks]);

  // 이전/다음 주 이동
  const goToToday = () => setCurrentDate(new Date());
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <MainLayout title="Scheduled Tasks" subtitle="Kuro's automated routines">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToPreviousWeek}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goToNextWeek}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-white/40">
          {weekDates[0].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {weekDates[6].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* 주간 그리드 */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDates.map((date, idx) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const tasks = tasksByDate[date.toDateString()] || [];

          return (
            <div
              key={idx}
              className={`min-h-[200px] rounded-lg border p-3 ${
                isToday
                  ? "bg-white/5 border-white/20"
                  : "bg-white/[0.02] border-white/10"
              }`}
            >
              {/* 날짜 헤더 */}
              <div className="text-center mb-3">
                <div className="text-xs text-white/40 uppercase">
                  {getDayName(date)}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday ? "text-white" : "text-white/60"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* 이벤트 목록 */}
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`text-xs p-2 rounded border-l-2 ${getEventColor(task.eventType)}`}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    {task.scheduledAt && (
                      <div className="text-white/50 mt-0.5">
                        {formatTime(task.scheduledAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 섹션 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Always Running */}
        <div className="bg-white/[0.02] rounded-lg border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span className="text-amber-400">⭐</span> Always Running
          </h3>
          <div className="space-y-2">
            {recurringTasks.length === 0 ? (
              <p className="text-sm text-white/40">No recurring tasks</p>
            ) : (
              recurringTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white/70">{task.title}</span>
                  <span className="text-white/40">
                    {task.recurrence || "Recurring"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next Up */}
        <div className="bg-white/[0.02] rounded-lg border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span>📋</span> Next Up
          </h3>
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-white/40">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => {
                const scheduledAt = task.scheduledAt;
                if (!scheduledAt) return null;

                return (
                  <NextUpItem
                    key={task._id}
                    task={task}
                    scheduledAt={scheduledAt}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
