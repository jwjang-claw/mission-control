"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { cronToHumanReadable } from "@/lib/cron";
import { CronDetailModal } from "@/components/CronDetailModal";

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

// 이벤트 색상 (Notion 스타일)
function getEventColor(eventType?: string): string {
  switch (eventType) {
    case "brief":
      return "bg-[var(--color-warning-bg)] border-l-[var(--color-warning)] text-[var(--color-text-primary)]";
    case "reminder":
      return "bg-[var(--color-success-bg)] border-l-[var(--color-success)] text-[var(--color-text-primary)]";
    case "cron":
      return "bg-[var(--color-kuro-bg)] border-l-[var(--color-kuro)] text-[var(--color-text-primary)]";
    default:
      return "bg-[var(--color-bg-secondary)] border-l-[var(--color-text-tertiary)] text-[var(--color-text-primary)]";
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
    <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-[var(--color-bg-hover)] transition-colors">
      <span className="text-[var(--color-text-primary)]">{task.title}</span>
      <span className="text-[var(--color-text-tertiary)] text-xs">
        {formattedTime}
      </span>
    </div>
  );
}

// Recurring Task 아이템
function RecurringTaskItem({
  task,
  onClick,
}: {
  task: Doc<"tasks">;
  onClick: (task: Doc<"tasks">) => void;
}) {
  return (
    <div
      className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
      title={task.fullTitle || task.title}
      onClick={() => onClick(task)}
    >
      <span className="text-[var(--color-text-primary)] truncate max-w-[60%]">
        {task.title}
      </span>
      <span className="text-[var(--color-text-tertiary)] text-xs shrink-0">
        {task.recurrence ? cronToHumanReadable(task.recurrence) : "Recurring"}
      </span>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<
    (typeof scheduledTasks)[number] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 크론 잡 클릭 핸들러
  const handleTaskClick = (task: (typeof recurringTasks)[number]) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <MainLayout title="Scheduled Tasks" subtitle="Kuro's automated routines">
      {/* Always Running 섹션 - 상단 */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <span className="text-base">⭐</span>
          <span>Always Running</span>
          <span className="text-xs text-[var(--color-text-tertiary)] font-normal ml-1">
            {recurringTasks.length} tasks
          </span>
        </h3>
        <div className="space-y-0.5">
          {recurringTasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)] py-2">
              No recurring tasks
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {recurringTasks.map((task) => (
                <RecurringTaskItem
                  key={task._id}
                  task={task}
                  onClick={handleTaskClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] rounded-md hover:bg-[var(--color-bg-hover)] transition-colors min-h-[44px] touch-active"
          >
            Today
          </button>
          <button
            onClick={goToPreviousWeek}
            className="p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors min-h-[44px] min-w-[44px] touch-active"
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
            className="p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors min-h-[44px] min-w-[44px] touch-active"
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
        <div className="text-sm text-[var(--color-text-secondary)] font-medium">
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

      {/* 주간 그리드 - 모바일에서 가로 스크롤 */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
        <div className="grid grid-cols-7 gap-2 min-w-[600px] md:min-w-0">
          {weekDates.map((date, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const tasks = tasksByDate[date.toDateString()] || [];

            return (
              <div
                key={idx}
                className={`min-h-[160px] sm:min-h-[180px] rounded-md border p-2 sm:p-2.5 ${
                  isToday
                    ? "bg-[var(--color-info-bg)] border-[var(--color-in-progress)]"
                    : "bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)]"
                }`}
              >
                {/* 날짜 헤더 */}
                <div className="text-center mb-2 pb-2 border-b border-[var(--color-border-subtle)]">
                  <div className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide">
                    {getDayName(date)}
                  </div>
                  <div
                    className={`text-base font-semibold mt-0.5 ${
                      isToday
                        ? "text-[var(--color-in-progress)]"
                        : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>

                {/* 이벤트 목록 */}
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`text-xs p-1.5 rounded border-l-2 ${getEventColor(task.eventType)} cursor-pointer hover:opacity-80 transition-opacity`}
                      title={task.fullTitle || task.title}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      {task.scheduledAt && (
                        <div className="text-[var(--color-text-tertiary)] mt-0.5 text-[10px]">
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
      </div>

      {/* Next Up 섹션 */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <span className="text-base">📋</span>
          <span>Next Up</span>
          <span className="text-xs text-[var(--color-text-tertiary)] font-normal ml-1">
            {upcomingTasks.length} scheduled
          </span>
        </h3>
        <div className="space-y-0.5">
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)] py-2">
              No upcoming tasks
            </p>
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

      {/* Cron Detail Modal */}
      {isModalOpen && selectedTask && (
        <CronDetailModal task={selectedTask} onClose={handleCloseModal} />
      )}
    </MainLayout>
  );
}
