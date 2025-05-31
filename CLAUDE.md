# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Development mode with TypeScript watcher
npm run dev

# Lint the code
npm run lint

# Format the code
npm run format

# Start the server
npm start

# Run a single test file
npx jest tests/journal.test.ts
```

## Architecture Overview

This is an MCP (Model Context Protocol) server that provides Claude with private journaling capabilities. The architecture consists of:

**Core Components:**
- `src/index.ts` - CLI entry point with intelligent path resolution for journal storage
- `src/server.ts` - MCP server using stdio transport with single `process_feelings` tool
- `src/journal.ts` - File system operations for timestamped markdown entries
- `src/types.ts` - TypeScript interfaces for the domain model

**Key Architecture Patterns:**
- **Path Resolution Strategy**: Falls back through CWD → HOME → temp directories, avoiding system roots
- **Timestamped Storage**: Uses `YYYY-MM-DD/HH-MM-SS-μμμμμμ.md` structure with microsecond precision
- **YAML Frontmatter**: Each entry includes structured metadata (title, ISO date, Unix timestamp)
- **MCP Tool Pattern**: Single tool registration with schema validation and error handling

**File Organization:**
- Journal entries stored in `.private-journal/` with daily subdirectories
- TypeScript compilation to `dist/` for production
- Jest tests in `tests/` directory with comprehensive file system mocking

## MCP Integration Details

The server provides one tool: `process_feelings` which accepts a `diary_entry` string parameter. The tool description emphasizes complete privacy and emotional honesty for Claude's internal processing.

## Testing Approach

- Uses Jest with ts-jest preset
- Tests focus on file system operations, timestamp formatting, and directory creation
- Temporary directories created/cleaned for each test to ensure isolation
- Coverage tracking specifically for core journal functionality (`src/journal.ts`, `src/types.ts`)