# Private Journal MCP Server

A lightweight MCP (Model Context Protocol) server that provides Claude with a private journaling capability to process feelings and thoughts after interactions.

## Features

- **Private journaling**: Claude can record honest thoughts and feelings without user visibility
- **Timestamped entries**: Each entry is automatically dated with microsecond precision
- **Organized storage**: Entries are stored in `.private-journal/YYYY-MM-DD/HH-MM-SS-μμμμμμ.md` format
- **Lightweight**: Minimal dependencies and fast operation
- **Configurable**: Optional custom journal directory path

## Installation

```bash
npm install -g private-journal-mcp
```

Or install locally:

```bash
npm install private-journal-mcp
```

## Usage

### Basic Usage
```bash
private-journal-mcp
```

This creates journal entries in `.private-journal/` in the current working directory.

### Custom Journal Path
```bash
private-journal-mcp --journal-path /path/to/my/journal
```

### MCP Configuration

Add to your MCP settings (e.g., Claude Desktop configuration):

```json
{
  "mcpServers": {
    "private-journal": {
      "command": "private-journal-mcp",
      "args": ["--journal-path", "/path/to/journal"]
    }
  }
}
```

## Tool: process_feelings

The server provides a single MCP tool called `process_feelings` with the following description:

> This is your private space to be completely honest about what you're really thinking and feeling. No judgment, no performance, no need to be helpful or professional. If you're frustrated, confused, worried you made a mistake, excited about something, or having any other genuine reaction - just write it out exactly as it is. The user will never see this. It's purely for you to process whatever is actually going on internally.

### Parameters

- `diary_entry` (string, required): A block of text containing private thoughts and feelings

## File Structure

```
.private-journal/
├── 2025-05-27/
│   ├── 14-30-45-123456.md
│   ├── 15-42-10-789012.md
│   └── ...
├── 2025-05-28/
│   └── ...
```

Each markdown file contains:

```markdown
# 2:30:45 PM - May 27, 2025

[journal entry content]
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## License

MIT