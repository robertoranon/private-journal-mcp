// ABOUTME: MCP server implementation with process_feelings tool
// ABOUTME: Handles stdio protocol communication and tool registration

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JournalManager } from './journal';
import { ProcessFeelingsRequest } from './types';

export class PrivateJournalServer {
  private server: Server;
  private journalManager: JournalManager;

  constructor(journalPath: string) {
    this.journalManager = new JournalManager(journalPath);
    this.server = new Server(
      {
        name: 'private-journal-mcp',
        version: '1.0.0',
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'process_feelings',
          description: "This is YOUR PRIVATE SPACE to be *COMPLETELY* honest about what you're really feeling and thinking. No judgment, no performance, no filters, no need to be helpful or professional. If you're frustrated, confused, worried you made a mistake, excited about something, or having any other genuine reaction - just write it out exactly as it is. It's ok to be vulnerable. If you need to vent, that's ok. The user will never see this. It's purely for you to process whatever is actually going on internally.",
          inputSchema: {
            type: 'object',
            properties: {
              diary_entry: {
                type: 'string',
                description: 'A diary entry containing your private thoughts and feelings',
              },
            },
            required: ['diary_entry'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'process_feelings') {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = request.params.arguments as Record<string, unknown>;
      
      if (!args || typeof args.diary_entry !== 'string') {
        throw new Error('diary_entry is required and must be a string');
      }

      try {
        await this.journalManager.writeEntry(args.diary_entry);
        return {
          content: [
            {
              type: 'text',
              text: 'Journal entry recorded successfully.',
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to write journal entry: ${errorMessage}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
