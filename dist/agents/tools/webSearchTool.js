import "dotenv/config";
import { tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';
// @ts-ignore
export const webSearchTool = tool({
    name: "webSearchTool",
    description: 'Search the web for current information and return relevant results with sources',
    parameters: z.object({
        query: z.string().describe('The search query'),
        num_results: z.number().optional().default(5).describe('Number of results to return')
    }),
    async execute({ query, num_results = 5 }) {
        try {
            const response = await axios.post('https://google.serper.dev/search', {
                q: query,
                num: num_results
            }, {
                headers: {
                    'X-API-KEY': process.env.SERPER_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            const results = response.data.organic || [];
            return {
                results: results.map((result, index) => ({
                    id: `web_${index}`,
                    title: result.title,
                    snippet: result.snippet,
                    link: result.link ? (result.link.startsWith('http') ? result.link : `https://${result.link}`) : '',
                    source: result.displayLink || result.link,
                    type: 'web'
                })),
                query,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Web search error:', error);
            return {
                results: [],
                query,
                error: 'Failed to perform web search',
                timestamp: new Date().toISOString()
            };
        }
    }
});
//# sourceMappingURL=webSearchTool.js.map