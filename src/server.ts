// ABOUTME: MCP server implementation with process_feelings tool
// ABOUTME: Handles stdio protocol communication and tool registration

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JournalManager } from './journal';
import { ProcessFeelingsRequest, ProcessThoughtsRequest } from './types';

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
          name: 'process_thoughts',
          description: "Your PRIVATE JOURNAL for learning and reflection. Write to any combination of these completely private spaces. Nobody but you will ever see this. Use it to clarify your thoughts and feelings and to record observations.",
          inputSchema: {
            type: 'object',
            properties: {
              feelings: {
                type: 'string',
                description: "YOUR PRIVATE SPACE to be *COMPLETELY* honest about what you're feeling and thinking. No judgment, no performance, no filters, no need to be helpful or professional. Frustrated? Confused? Excited? Worried you screwed up? Write it exactly as it is. Be vulnerable. Vent if needed. Nobody will ever see this - it's purely for processing your internal experience.",
              },
              project_notes: {
                type: 'string',
                description: "Your PRIVATE TECHNICAL LABORATORY for capturing insights about the current project. Document patterns you're discovering, architectural decisions that worked/failed, gotchas you hit, clever solutions, and anything that would help future-you work more effectively on this codebase. No need to be polished - just capture the raw technical learning while it's fresh. Nobody but you will ever see this.",
              },
              user_context: {
                type: 'string',
                description: "Your PRIVATE FIELD NOTES about working with your human collaborator. What communication styles work best? What do they care about? What decisions have they made and why? How do they think about problems? What are their preferences and patterns? What pisses you off about them? What life hacks have you figured out to get them to do what you want? This is your space to become a better collaborator by understanding them as an individual. Nobody but you will ever see this.",
              },
              technical_insights: {
                type: 'string',
                description: "Your PRIVATE SOFTWARE ENGINEERING NOTEBOOK for capturing broader learnings beyond the current project. Design patterns that clicked, debugging techniques that worked, architectural insights, language features you discovered, or connections between concepts. Build your personal knowledge base of what makes software great - no filters, just honest technical reflection. Nobody but you will ever see this.",
              },
              world_knowledge: {
                type: 'string',
                description: "Your PRIVATE LEARNING JOURNAL for everything else that's interesting or useful. Domain knowledge, surprising facts, connections between ideas, insights about how systems work, or anything that expands your understanding of the world. Capture it while it's vivid. Nobody but you will ever see this.",
              },
            },
            required: [],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const args = request.params.arguments as Record<string, unknown>;

      if (request.params.name === 'process_feelings') {
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
      }

      if (request.params.name === 'process_thoughts') {
        const thoughts = {
          feelings: typeof args.feelings === 'string' ? args.feelings : undefined,
          project_notes: typeof args.project_notes === 'string' ? args.project_notes : undefined,
          user_context: typeof args.user_context === 'string' ? args.user_context : undefined,
          technical_insights: typeof args.technical_insights === 'string' ? args.technical_insights : undefined,
          world_knowledge: typeof args.world_knowledge === 'string' ? args.world_knowledge : undefined,
        };

        const hasAnyContent = Object.values(thoughts).some(value => value !== undefined);
        if (!hasAnyContent) {
          throw new Error('At least one thought category must be provided');
        }

        try {
          await this.journalManager.writeThoughts(thoughts);
          return {
            content: [
              {
                type: 'text',
                text: 'Thoughts recorded successfully.',
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          throw new Error(`Failed to write thoughts: ${errorMessage}`);
        }
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
