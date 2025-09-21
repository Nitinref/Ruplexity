import 'dotenv/config';
import { Agent } from '@openai/agents';
export declare const perplexityAgent: Agent<unknown, "text">;
export declare function processQuery(query: string, conversationId?: string): Promise<{
    answer: string | undefined;
    sources: any[];
    conversationId: string;
    followUpQuestions: string[];
    timestamp: string;
}>;
//# sourceMappingURL=perplexityAgent.d.ts.map