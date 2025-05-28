#!/usr/bin/env node

// ABOUTME: Main entry point for the private journal MCP server
// ABOUTME: Handles command line arguments and starts the server

import * as path from 'path';
import { PrivateJournalServer } from './server';

function parseArguments(): string {
  const args = process.argv.slice(2);
  
  // Safely get current working directory with fallbacks
  let cwd: string;
  try {
    cwd = process.cwd();
  } catch (error) {
    // If cwd fails, use home directory or /tmp as fallback
    cwd = process.env.HOME || process.env.USERPROFILE || '/tmp';
  }
  
  let journalPath = path.join(cwd, '.private-journal');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--journal-path' && i + 1 < args.length) {
      journalPath = path.resolve(args[i + 1]);
      break;
    }
  }

  return journalPath;
}

async function main(): Promise<void> {
  try {
    const journalPath = parseArguments();
    
    // Log the journal path to stderr for debugging (won't interfere with MCP protocol)
    console.error(`Private journal will be stored at: ${journalPath}`);
    
    const server = new PrivateJournalServer(journalPath);
    await server.run();
  } catch (error) {
    console.error('Failed to start private journal MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});