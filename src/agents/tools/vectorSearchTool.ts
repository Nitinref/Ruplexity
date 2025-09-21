// @ts-ignore
import { tool } from '@openai/agents';
// @ts-ignore
import { z } from 'zod';
import { qdrantService } from '../../services/qdrantService.js';

export const vectorSearchTool = tool({
  name: 'vector_search',
  description: 'Search through indexed documents using semantic similarity with Qdrant vector database',
  parameters: z.object({
    query: z.string().describe('The search query'),
    collection_name: z.string().nullable().optional().default('documents').describe('Collection to search in'),
    limit: z.number().nullable().optional().default(5).describe('Number of results to return'),
    score_threshold: z.number().nullable().optional().default(0.7).describe('Minimum similarity score threshold')
  }),
  async execute({ query, collection_name = 'documents', limit = 5, score_threshold = 0.7 }) {
    try {
      // @ts-ignore
      const results = await qdrantService.searchSimilar(query, collection_name, limit, score_threshold);
      
      return {
        results: results.map((result, index) => ({
          id: `vector_${index}`,
          content: result.content,
          metadata: {
            title: result.metadata.title || '',
            url: result.metadata.url || '',
            source: result.metadata.source || '',
            created_at: result.metadata.created_at || '',
            ...result.metadata
          },
          score: result.score,
          type: 'vector'
        })),
        query,
        collection: collection_name,
        total_results: results.length,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Qdrant vector search error:', error);
      
      // Handle specific Qdrant errors
      if (error.message?.includes('Collection not found')) {
        return {
          results: [],
          query,
          error: `Collection '${collection_name}' not found. Please index some documents first.`,
          timestamp: new Date().toISOString()
        };
      }
      
      if (error.message?.includes('Connection refused')) {
        return {
          results: [],
          query,
          error: 'Cannot connect to Qdrant database. Please ensure Qdrant is running on localhost:6333',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        results: [],
        query,
        error: `Vector search failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
});
