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

This is an MCP (Model Context Protocol) server that provides Claude with private journaling and semantic search capabilities. The architecture consists of:

**Core Components:**
- `src/index.ts` - CLI entry point with intelligent path resolution for journal storage
- `src/server.ts` - MCP server using stdio transport with tool registration and request handling
- `src/journal.ts` - File system operations for timestamped markdown entries and embedding generation
- `src/paths.ts` - Cross-platform path resolution with fallback logic (CWD → HOME → temp)
- `src/embeddings.ts` - Local AI embedding generation using @xenova/transformers (singleton pattern)
- `src/search.ts` - Vector similarity search and entry retrieval across journal collections
- `src/types.ts` - TypeScript interfaces for the domain model

**Key Architecture Patterns:**
- **Path Resolution Strategy**: `paths.ts` provides dual-path logic - project paths include CWD, user paths skip it
- **Timestamped Storage**: Uses `YYYY-MM-DD/HH-MM-SS-μμμμμμ.md` structure with microsecond precision
- **YAML Frontmatter**: Each entry includes structured metadata (title, ISO date, Unix timestamp)
- **Embedding Pipeline**: On entry write → extract text → generate embedding → save `.embedding` file alongside markdown
- **Startup Indexing**: `generateMissingEmbeddings()` scans both paths on server startup to backfill missing embeddings
- **Singleton Embedding Service**: Single model instance shared across all operations to avoid memory overhead

**File Organization:**
- **Project journals**: `.private-journal/` in project root for project-specific notes
- **Personal journals**: `~/.private-journal/` for cross-project personal thoughts  
- **Daily structure**: `YYYY-MM-DD/HH-MM-SS-μμμμμμ.md` with microsecond precision
- **Search index**: `.embedding` files alongside each journal entry for semantic search
- TypeScript compilation to `dist/` for production
- Jest tests in `tests/` directory with comprehensive file system mocking

## MCP Integration Details

The server provides comprehensive journaling and search capabilities through these tools:

**Core Journaling:**
- `process_thoughts` - Multi-section private journaling with categories for feelings, project notes, user context, technical insights, and world knowledge

**Search & Retrieval:**
- `search_journal` - Natural language semantic search across all journal entries using local AI embeddings
- `read_journal_entry` - Read full content of specific entries by file path
- `list_recent_entries` - Browse recent entries chronologically with date filtering

**Key Features:**
- **Dual Storage**: Project notes stored locally with codebase, personal thoughts in user's home directory
- **Local AI Search**: Uses @xenova/transformers for semantic understanding without external API calls
- **Automatic Indexing**: Embeddings generated automatically for all entries on first startup and ongoing writes
- **Privacy First**: All processing happens locally, no data leaves your machine

## Testing Approach

- Uses Jest with ts-jest preset and mocked transformers library for embedding tests
- Tests cover file system operations, timestamp formatting, directory creation, and search functionality
- Temporary directories created/cleaned for each test to ensure isolation
- Coverage tracking for core functionality (`src/journal.ts`, `src/types.ts`, `src/paths.ts`, `src/embeddings.ts`, `src/search.ts`)
- Comprehensive embedding and search test suite with proper mocking for CI/CD environments