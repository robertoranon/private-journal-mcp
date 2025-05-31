// ABOUTME: Unit tests for journal writing functionality
// ABOUTME: Tests file system operations, timestamps, and formatting

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { JournalManager } from '../src/journal';

function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('JournalManager', () => {
  let tempDir: string;
  let journalManager: JournalManager;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'journal-test-'));
    journalManager = new JournalManager(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('writes journal entry to correct file structure', async () => {
    const content = 'This is a test journal entry.';
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    
    const files = await fs.readdir(dayDir);
    expect(files).toHaveLength(1);
    
    const fileName = files[0];
    expect(fileName).toMatch(/^\d{2}-\d{2}-\d{2}-\d{6}\.md$/);
  });

  test('creates directory structure automatically', async () => {
    const content = 'Test entry';
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    
    const stats = await fs.stat(dayDir);
    expect(stats.isDirectory()).toBe(true);
  });

  test('formats entry content correctly', async () => {
    const content = 'This is my journal entry content.';
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    const files = await fs.readdir(dayDir);
    const filePath = path.join(dayDir, files[0]);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    expect(fileContent).toContain('---');
    expect(fileContent).toContain('title: "');
    expect(fileContent).toContain('date: ');
    expect(fileContent).toContain('timestamp: ');
    expect(fileContent).toContain(' - ');
    expect(fileContent).toContain(content);
    
    // Check YAML frontmatter structure
    const lines = fileContent.split('\n');
    expect(lines[0]).toBe('---');
    expect(lines[1]).toMatch(/^title: ".*"$/);
    expect(lines[2]).toMatch(/^date: \d{4}-\d{2}-\d{2}T/);
    expect(lines[3]).toMatch(/^timestamp: \d+$/);
    expect(lines[4]).toBe('---');
    expect(lines[5]).toBe('');
    expect(lines[6]).toBe(content);
  });

  test('handles multiple entries on same day', async () => {
    await journalManager.writeEntry('First entry');
    await journalManager.writeEntry('Second entry');

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    const files = await fs.readdir(dayDir);
    
    expect(files).toHaveLength(2);
    expect(files[0]).not.toEqual(files[1]);
  });

  test('handles empty content', async () => {
    const content = '';
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    const files = await fs.readdir(dayDir);
    
    expect(files).toHaveLength(1);
    
    const filePath = path.join(dayDir, files[0]);
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    expect(fileContent).toContain('---');
    expect(fileContent).toContain('title: "');
    expect(fileContent).toContain(' - ');
    expect(fileContent).toMatch(/date: \d{4}-\d{2}-\d{2}T/);
    expect(fileContent).toMatch(/timestamp: \d+/);
  });

  test('handles large content', async () => {
    const content = 'A'.repeat(10000);
    
    await journalManager.writeEntry(content);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    const files = await fs.readdir(dayDir);
    const filePath = path.join(dayDir, files[0]);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    expect(fileContent).toContain(content);
  });

  test('writes thoughts to correct file structure with sections', async () => {
    const thoughts = {
      feelings: 'I feel great about this feature',
      project_notes: 'The architecture is solid',
      technical_insights: 'TypeScript interfaces are powerful'
    };
    
    await journalManager.writeThoughts(thoughts);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    
    const files = await fs.readdir(dayDir);
    expect(files).toHaveLength(1);
    
    const fileName = files[0];
    expect(fileName).toMatch(/^\d{2}-\d{2}-\d{2}-\d{6}\.md$/);
    
    const filePath = path.join(dayDir, fileName);
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    expect(fileContent).toContain('## Feelings');
    expect(fileContent).toContain('I feel great about this feature');
    expect(fileContent).toContain('## Project Notes');
    expect(fileContent).toContain('The architecture is solid');
    expect(fileContent).toContain('## Technical Insights');
    expect(fileContent).toContain('TypeScript interfaces are powerful');
  });

  test('handles thoughts with only one section', async () => {
    const thoughts = {
      world_knowledge: 'Learned something interesting about databases'
    };
    
    await journalManager.writeThoughts(thoughts);

    const today = new Date();
    const dateString = getFormattedDate(today);
    const dayDir = path.join(tempDir, dateString);
    const files = await fs.readdir(dayDir);
    const filePath = path.join(dayDir, files[0]);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    expect(fileContent).toContain('## World Knowledge');
    expect(fileContent).toContain('Learned something interesting about databases');
    expect(fileContent).not.toContain('## Feelings');
    expect(fileContent).not.toContain('## Project Notes');
  });
});