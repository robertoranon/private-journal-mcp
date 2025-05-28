#!/usr/bin/env node

// ABOUTME: Main entry point for the private journal MCP server
// ABOUTME: Handles command line arguments and starts the server

import * as path from 'path';
import { PrivateJournalServer } from './server';

function parseArguments(): string {
  const args = process.argv.slice(2);
  let journalPath = path.join(process.cwd(), '.private-journal');

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