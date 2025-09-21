import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
const openai = new OpenAI();
// @ts-ignore
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
});
export class QdrantService {
    async ensureCollection(collectionName) {
        try {
            await qdrantClient.getCollection(collectionName);
        }
        catch {
            await qdrantClient.createCollection(collectionName, {
                vectors: {
                    size: 1536, // text-embedding-3-small dimension
                    distance: 'Cosine'
                }
            });
            console.log(`Created collection: ${collectionName}`);
        }
    }
    async indexWebResults(results, collectionName = 'web_search_cache') {
        await this.ensureCollection(collectionName);
        const points = [];
        for (const result of results) {
            if (!result.snippet)
                continue;
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: result.snippet
            });
            points.push({
                id: uuidv4(),
                // @ts-ignore
                vector: embedding.data[0].embedding,
                payload: {
                    title: result.title,
                    content: result.snippet,
                    url: result.link,
                    source: result.source,
                    type: 'web_result',
                    indexed_at: new Date().toISOString()
                }
            });
        }
        if (points.length > 0) {
            await qdrantClient.upsert(collectionName, {
                wait: true,
                points
            });
        }
    }
    async indexPDFContent(content, metadata, collectionName = 'pdf_documents') {
        await this.ensureCollection(collectionName);
        // Split PDF content into chunks for better retrieval
        const chunks = this.splitTextIntoChunks(content, 1000, 200);
        const points = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                // @ts-ignore
                input: chunk
            });
            points.push({
                id: uuidv4(),
                // @ts-ignore
                vector: embedding.data[0].embedding,
                payload: {
                    content: chunk,
                    chunk_index: i,
                    total_chunks: chunks.length,
                    file_path: metadata.file_path,
                    file_size: metadata.file_size,
                    total_pages: metadata.total_pages,
                    type: 'pdf_chunk',
                    indexed_at: new Date().toISOString()
                }
            });
        }
        await qdrantClient.upsert(collectionName, {
            wait: true,
            points
        });
        return { chunks: chunks.length, collection: collectionName };
    }
    splitTextIntoChunks(text, chunkSize, overlap) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            const chunk = text.slice(start, end);
            chunks.push(chunk);
            start = end - overlap;
            if (start >= text.length - overlap)
                break;
        }
        return chunks;
    }
    async searchSimilar(query, collectionName, limit = 5, scoreThreshold = 0.7) {
        try {
            await this.ensureCollection(collectionName);
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query
            });
            const results = await qdrantClient.search(collectionName, {
                // @ts-ignore
                vector: embedding.data[0].embedding,
                limit,
                score_threshold: scoreThreshold,
                with_payload: true,
                with_vector: false
            });
            return results.map((result, index) => ({
                id: `${collectionName}_${index}`,
                content: result.payload?.content || '',
                metadata: result.payload || {},
                score: result.score || 0,
                type: 'vector'
            }));
        }
        catch (error) {
            console.error('Vector search error:', error);
            return [];
        }
    }
    async getCollectionInfo(collectionName) {
        try {
            const info = await qdrantClient.getCollection(collectionName);
            const count = await qdrantClient.count(collectionName);
            return {
                ...info,
                points_count: count.count
            };
        }
        catch (error) {
            return null;
        }
    }
    async listCollections() {
        try {
            const collections = await qdrantClient.getCollections();
            return collections.collections;
        }
        catch (error) {
            return [];
        }
    }
    async deleteCollection(collectionName) {
        await qdrantClient.deleteCollection(collectionName);
    }
}
export const qdrantService = new QdrantService();
//# sourceMappingURL=qdrantService.js.map