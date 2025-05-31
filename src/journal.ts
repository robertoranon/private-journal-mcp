// ABOUTME: Core journal writing functionality for MCP server
// ABOUTME: Handles file system operations, timestamps, and markdown formatting

import * as fs from 'fs/promises';
import * as path from 'path';
import { JournalEntry } from './types';

export class JournalManager {
  private journalPath: string;

  constructor(journalPath: string) {
    this.journalPath = journalPath;
  }

  async writeEntry(content: string): Promise<void> {
    const timestamp = new Date();
    const dateString = this.formatDate(timestamp);
    const timeString = this.formatTimestamp(timestamp);
    
    const dayDirectory = path.join(this.journalPath, dateString);
    const fileName = `${timeString}.md`;
    const filePath = path.join(dayDirectory, fileName);

    await this.ensureDirectoryExists(dayDirectory);
    
    const formattedEntry = this.formatEntry(content, timestamp);
    await fs.writeFile(filePath, formattedEntry, 'utf8');
  }

  async writeThoughts(thoughts: {
    feelings?: string;
    project_notes?: string;
    user_context?: string;
    technical_insights?: string;
    world_knowledge?: string;
  }): Promise<void> {
    const timestamp = new Date();
    const dateString = this.formatDate(timestamp);
    const timeString = this.formatTimestamp(timestamp);
    
    const dayDirectory = path.join(this.journalPath, dateString);
    const fileName = `${timeString}.md`;
    const filePath = path.join(dayDirectory, fileName);

    await this.ensureDirectoryExists(dayDirectory);
    
    const formattedEntry = this.formatThoughts(thoughts, timestamp);
    await fs.writeFile(filePath, formattedEntry, 'utf8');
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimestamp(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const microseconds = String(date.getMilliseconds() * 1000 + Math.floor(Math.random() * 1000)).padStart(6, '0');
    return `${hours}-${minutes}-${seconds}-${microseconds}`;
  }

  private formatEntry(content: string, timestamp: Date): string {
    const timeDisplay = timestamp.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const dateDisplay = timestamp.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `---
title: "${timeDisplay} - ${dateDisplay}"
date: ${timestamp.toISOString()}
timestamp: ${timestamp.getTime()}
---

${content}
`;
  }

  private formatThoughts(thoughts: {
    feelings?: string;
    project_notes?: string;
    user_context?: string;
    technical_insights?: string;
    world_knowledge?: string;
  }, timestamp: Date): string {
    const timeDisplay = timestamp.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const dateDisplay = timestamp.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const sections = [];
    
    if (thoughts.feelings) {
      sections.push(`## Feelings\n\n${thoughts.feelings}`);
    }
    
    if (thoughts.project_notes) {
      sections.push(`## Project Notes\n\n${thoughts.project_notes}`);
    }
    
    if (thoughts.user_context) {
      sections.push(`## User Context\n\n${thoughts.user_context}`);
    }
    
    if (thoughts.technical_insights) {
      sections.push(`## Technical Insights\n\n${thoughts.technical_insights}`);
    }
    
    if (thoughts.world_knowledge) {
      sections.push(`## World Knowledge\n\n${thoughts.world_knowledge}`);
    }

    return `---
title: "${timeDisplay} - ${dateDisplay}"
date: ${timestamp.toISOString()}
timestamp: ${timestamp.getTime()}
---

${sections.join('\n\n')}
`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (mkdirError) {
        throw new Error(`Failed to create journal directory at ${dirPath}: ${mkdirError instanceof Error ? mkdirError.message : mkdirError}`);
      }
    }
  }
}