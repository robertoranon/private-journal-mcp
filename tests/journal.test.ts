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
    
    expect(fileContent).toContain('# ');
    expect(fileContent).toContain(' - ');
    expect(fileContent).toContain(content);
    expect(fileContent.split('\n')).toHaveLength(4); // header, empty line, content, final newline
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
    
    expect(fileContent).toContain('# ');
    expect(fileContent).toContain(' - ');
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
});