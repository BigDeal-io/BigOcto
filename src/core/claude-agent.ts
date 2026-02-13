import type { Issue } from '../types.js';
import { buildSystemPromptAdditions, buildIssuePrompt } from './context-builder.js';
import { logSession } from './knowledge.js';

export interface ClaudeAgentOptions {
  issue: Issue;
  repository: string;
  repoPath?: string;
  model?: string;
  maxTurns?: number;
  includeComments?: boolean;
  cwd?: string;
}

export interface AgentMessage {
  type: 'text' | 'tool_use' | 'result' | 'error';
  content: string;
  timestamp: number;
}

export async function* launchClaudeAgent(options: ClaudeAgentOptions): AsyncGenerator<AgentMessage> {
  const {
    issue,
    repository,
    repoPath,
    model = 'sonnet',
    maxTurns = 50,
    includeComments = true,
    cwd,
  } = options;

  const contextAdditions = buildSystemPromptAdditions({
    issue,
    repoPath,
    includeComments,
  });

  const prompt = buildIssuePrompt(issue);

  logSession({
    repository,
    issueNumber: issue.number,
    action: 'Sent to Claude Agent',
    details: `Model: ${model}, Max turns: ${maxTurns}, Comments: ${includeComments}`,
  });

  yield {
    type: 'text',
    content: `Launching Claude Agent for issue #${issue.number}...`,
    timestamp: Date.now(),
  };

  try {
    // Dynamic import to avoid requiring the SDK at startup
    // @ts-ignore - SDK is an optional dependency
    const { query } = await import('@anthropic-ai/claude-agent-sdk');

    const q = query({
      prompt,
      options: {
        model,
        maxTurns,
        cwd: cwd ?? process.cwd(),
        allowedTools: ['Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'],
        appendSystemPrompt: contextAdditions,
        permissionMode: 'acceptEdits',
      },
    });

    for await (const message of q) {
      if (message.type === 'assistant' && message.message) {
        const textContent = message.message.content.find((c: any) => c.type === 'text');
        if (textContent && 'text' in textContent) {
          yield {
            type: 'text',
            content: textContent.text,
            timestamp: Date.now(),
          };
        }

        const toolUse = message.message.content.find((c: any) => c.type === 'tool_use');
        if (toolUse && 'name' in toolUse) {
          yield {
            type: 'tool_use',
            content: `Using tool: ${toolUse.name}`,
            timestamp: Date.now(),
          };
        }
      }

      if (message.type === 'result') {
        yield {
          type: 'result',
          content: `Agent completed. Cost: $${message.total_cost_usd?.toFixed(4) ?? 'unknown'}`,
          timestamp: Date.now(),
        };
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorMessage.includes('Cannot find module') || errorMessage.includes('claude-agent-sdk')) {
      yield {
        type: 'error',
        content: 'Claude Agent SDK not installed. Run: npm install @anthropic-ai/claude-agent-sdk',
        timestamp: Date.now(),
      };
    } else {
      yield {
        type: 'error',
        content: `Agent error: ${errorMessage}`,
        timestamp: Date.now(),
      };
    }
  }
}
