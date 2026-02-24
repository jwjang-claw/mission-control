// Types for memory entries (shared between components)

export interface MemorySection {
  time: string;
  title: string;
  preview: string;
  content: string;
}

export interface MemoryEntry {
  _id: string;
  slug: string; // "MEMORY" or "2026-02-24"
  title: string;
  date: string; // ISO date string
  content: string; // 전체 내용
  sections: MemorySection[]; // 파싱된 섹션들
  isLongTerm: boolean; // MEMORY.md 여부
  createdAt: number;
  updatedAt: number;
}
