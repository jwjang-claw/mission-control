import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE_PATH = path.join(
  process.env.HOME || "",
  ".openclaw",
  "workspace"
);

interface MemorySection {
  time: string;
  title: string;
  preview: string;
  content: string;
}

interface MemoryEntry {
  slug: string;
  title: string;
  date: string;
  content: string;
  sections: MemorySection[];
  isLongTerm: boolean;
}

function parseMemoryFile(filename: string, content: string): MemoryEntry {
  const slug = filename.replace(".md", "");
  const isLongTerm = slug === "MEMORY";

  // Extract title from first heading or use date
  let title = slug;
  const firstHeadingMatch = content.match(/^#\s+(.+)$/m);
  if (firstHeadingMatch) {
    title = firstHeadingMatch[1];
  } else if (!isLongTerm) {
    // Format date nicely
    const dateMatch = slug.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      title = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Parse sections (## headers)
  const sections: MemorySection[] = [];
  const sectionMatches = content.split(/(?=^## )/gm).filter(Boolean);

  for (const sectionContent of sectionMatches) {
    const headingMatch = sectionContent.match(/^##\s+(.+)$/m);
    if (headingMatch) {
      const sectionTitle = headingMatch[1];
      const bodyContent = sectionContent.replace(/^##\s+.+$/m, "").trim();

      // Generate preview (first 150 chars of meaningful content)
      const preview = bodyContent
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 150);

      // Try to extract time from title (e.g., "08:01 AM — Title")
      const timeMatch = sectionTitle.match(
        /^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-—]\s*(.+)$/i
      );
      const time = timeMatch ? timeMatch[1] : "";
      const finalTitle = timeMatch ? timeMatch[2] : sectionTitle;

      sections.push({
        time,
        title: finalTitle,
        preview: preview + (bodyContent.length > 150 ? "..." : ""),
        content: bodyContent,
      });
    }
  }

  return {
    slug,
    title: isLongTerm ? "Long-Term Memory" : title,
    date: new Date().toISOString(),
    content,
    sections,
    isLongTerm,
  };
}

function getMemories(): MemoryEntry[] {
  const memories: MemoryEntry[] = [];

  // Read MEMORY.md (long-term memory)
  const memoryPath = path.join(WORKSPACE_PATH, "MEMORY.md");
  if (fs.existsSync(memoryPath)) {
    const content = fs.readFileSync(memoryPath, "utf-8");
    const stats = fs.statSync(memoryPath);
    const entry = parseMemoryFile("MEMORY.md", content);
    entry.date = stats.mtime.toISOString();
    memories.push(entry);
  }

  // Read memory/*.md (daily notes)
  const memoryDir = path.join(WORKSPACE_PATH, "memory");
  if (fs.existsSync(memoryDir)) {
    const files = fs
      .readdirSync(memoryDir)
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

    for (const file of files) {
      const filePath = path.join(memoryDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const stats = fs.statSync(filePath);
      const entry = parseMemoryFile(file, content);
      entry.date = stats.mtime.toISOString();
      memories.push(entry);
    }
  }

  return memories;
}

export async function GET() {
  try {
    const memories = getMemories();
    return NextResponse.json(memories);
  } catch (error) {
    console.error("Failed to read memories:", error);
    return NextResponse.json(
      { error: "Failed to read memories" },
      { status: 500 }
    );
  }
}
