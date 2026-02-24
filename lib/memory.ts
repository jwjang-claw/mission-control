// Types for memory entries (shared between client and server)

export interface MemorySection {
  time: string;
  title: string;
  preview: string;
  content: string;
}

export interface MemoryEntry {
  slug: string; // "MEMORY" or "2026-02-24"
  title: string; // 파일의 첫 헤딩 또는 날짜
  date: string; // ISO date string
  content: string; // 전체 내용
  sections: MemorySection[]; // 파싱된 섹션들
  isLongTerm: boolean; // MEMORY.md 여부
}

// Client-side fetch function
export async function fetchMemories(): Promise<MemoryEntry[]> {
  const response = await fetch("/api/memory");
  if (!response.ok) {
    throw new Error("Failed to fetch memories");
  }
  return response.json();
}
