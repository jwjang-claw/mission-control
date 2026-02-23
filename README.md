# 🚀 Mission Control - Task Board

Real-time task board dashboard built with Next.js 14+, Convex, and Tailwind CSS.

## Features

- ✅ **Real-time Updates**: Powered by Convex subscriptions for instant data sync
- 📋 **Three-Column Layout**: In Progress 🔥, Done ✅, and Pending/Blocked 📌
- 👥 **Assignee Management**: Tasks assigned to Kuro 🐱 or snail 👤
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🔄 **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- 🧪 **Unit Tests**: Comprehensive test coverage with Vitest

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Convex** - Real-time database backend
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vitest** - Fast unit testing
- **Testing Library** - React component testing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Convex:**
   ```bash
   npx convex login
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Generate type definitions in `convex/_generated/`
   - Start the Convex dev server

3. **Configure environment:**
   The `.env.local` file will be automatically created with your Convex URL:
   ```
   NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mission-control/
├── app/
│   ├── layout.tsx         # Root layout with ConvexProvider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── TaskBoard.tsx      # Main task board component
│   └── __tests__/         # Component tests
├── convex/
│   ├── schema.ts          # Database schema
│   ├── tasks.ts           # Task queries & mutations
│   └── config.ts          # Convex configuration
├── lib/
│   └── convex.ts          # Convex client setup
└── vitest.config.ts       # Test configuration
```

## Usage

### Creating Tasks

1. Enter a task title in the input field
2. Select an assignee (Kuro 🐱 or snail 👤)
3. Choose initial status (Pending, In Progress, Done, or Blocked)
4. Click "Add Task"

### Managing Tasks

- **Change Status**: Click any status button on a task card to move it between columns
- **Delete**: Click the 🗑️ icon to remove a task (with confirmation)

## Testing

Run the test suite:

```bash
# Run tests once
npm run test:run

# Watch mode
npm test

# UI mode
npm run test:ui
```

## Task Schema

```typescript
{
  _id: string,      // Auto-generated ID
  title: string,    // Task title
  assignee: string, // "Kuro 🐱" or "snail 👤"
  status: string,   // "in-progress" | "done" | "pending" | "blocked"
  updatedAt: number // Timestamp
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_CONVEX_URL` environment variable
4. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

## Development Tips

- **Convex Dashboard**: Visit [dashboard.convex.dev](https://dashboard.convex.dev) to view your data
- **Hot Reload**: Both Next.js and Convex support hot reload during development
- **Type Safety**: Run `npx convex dev` to regenerate types after schema changes

## License

MIT
