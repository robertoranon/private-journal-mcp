// ABOUTME: Type definitions for the private journal MCP server
// ABOUTME: Defines interfaces for journal entries and configuration

export interface JournalEntry {
  content: string;
  timestamp: Date;
  filePath: string;
}

export interface ServerConfig {
  journalPath: string;
}

export interface ProcessFeelingsRequest {
  diary_entry: string;
}