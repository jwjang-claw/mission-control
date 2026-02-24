
import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";

// Load environment variables
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper function to parse markdown content and extract sections
function parseMarkdownSections(content: string): Array<{
  time: string;
  title: string;
  preview: string;
  content: string;
}> {
  const sections: Array<{
    time: string;
    title: string;
    preview: string;
    content: string;
  }> = [];

  // Split by ## headers
  const lines = content.split('\n');
  let currentSection: { title: string; content: string; startTime?: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^##\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        const preview = currentSection.content.slice(0, 100).trim();
        sections.push({
          time: currentSection.startTime || '',
          title: currentSection.title,
          preview: preview + (preview.length < currentSection.content.length ? '...' : ''),
          content: currentSection.content.trim(),
        });
      }

      // Start new section
      const title = headerMatch[1].trim();
      // Check if title starts with a time pattern (HH:MM)
      const timeMatch = title.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-—–]\s*/i);
      
      if (timeMatch) {
        currentSection = {
          startTime: timeMatch[1],
          title: title.slice(timeMatch[0].length).trim(),
          content: '',
        };
      } else {
        currentSection = { title, content: '' };
      }
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  // Don't forget the last section
  if (currentSection) {
    const preview = currentSection.content.slice(0, 100).trim();
    sections.push({
      time: currentSection.startTime || '',
      title: currentSection.title,
      preview: preview + (preview.length < currentSection.content.length ? '...' : ''),
      content: currentSection.content.trim(),
    });
  }

  return sections;
}

async function syncMemories() {
  const workspacePath = '/home/jwjang/.openclaw/workspace';
  const memoryDir = path.join(workspacePath, 'memory');
  const mainMemoryPath = path.join(workspacePath, 'MEMORY.md');

  console.log('Starting memory sync...');

  // Sync Long-Term Memory
  try {
    const content = await fs.readFile(mainMemoryPath, 'utf-8');
    const sections = parseMarkdownSections(content);
    const now = Date.now();

    await client.mutation(api.memories.upsert, {
      slug: 'MEMORY',
      title: 'Long-Term Memory',
      date: new Date(now).toISOString().split('T')[0],
      content,
      sections,
      isLongTerm: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log('✅ Synced MEMORY.md (Long-Term)');
  } catch (err) {
    console.error(`❌ Failed to sync MEMORY.md: ${err}`);
  }

  // Sync Daily Memories
  try {
    const files = await fs.readdir(memoryDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      try {
        const content = await fs.readFile(path.join(memoryDir, file), 'utf-8');
        const sections = parseMarkdownSections(content);
        
        // Extract date from filename
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : file.replace('.md', '');
        
        // Parse date for title
        const parsedDate = new Date(date);
        const title = parsedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const slug = date;
        const now = Date.now();

        await client.mutation(api.memories.upsert, {
          slug,
          title,
          date,
          content,
          sections,
          isLongTerm: false,
          createdAt: now,
          updatedAt: now,
        });
        console.log(`✅ Synced ${file}`);
      } catch (err) {
        console.error(`❌ Failed to sync ${file}: ${err}`);
      }
    }
  } catch (err) {
    console.error(`❌ Failed to read memory directory: ${err}`);
  }
}

syncMemories().catch(console.error);
