import express from 'express';
import { processQuery } from '../agents/perplexityAgent.js';
import { qdrantService } from '../services/qdrantService.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// Main search endpoint
router.post('/query', async (req, res) => {
    try {
        const { query, conversationId } = req.body;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }
        const result = await processQuery(query, conversationId || uuidv4());
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// File upload for PDF analysis
// @ts-ignore
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'PDF file is required'
            });
        }
        const { query } = req.body;
        const filePath = req.file.path;
        // Process query with PDF context
        const contextualQuery = `Analyze the PDF at ${filePath} and answer: ${query}`;
        const result = await processQuery(contextualQuery, uuidv4());
        res.json({
            success: true,
            data: result,
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size
            }
        });
        // Clean up uploaded file after processing
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err)
                    console.error('Error deleting uploaded file:', err);
            });
        }, 10000); // Delete after 10 seconds
    }
    catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process PDF'
        });
    }
});
// Index document endpoint (for adding documents to vector DB)
router.post('/index', async (req, res) => {
    try {
        const { content, metadata, collection } = req.body;
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required'
            });
        }
        const result = await qdrantService.indexPDFContent(content, metadata || {}, collection || 'documents');
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Indexing error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to index document'
        });
    }
});
// Get conversation history
router.get('/conversation/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Implementation would retrieve from persistent storage
        res.json({
            success: true,
            data: {
                conversationId: id,
                messages: [] // Would retrieve actual history
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation'
        });
    }
});
// Qdrant management endpoints
router.get('/collections', async (req, res) => {
    try {
        const collections = await qdrantService.listCollections();
        res.json({
            success: true,
            data: collections
        });
    }
    catch (error) {
        console.error('Collections error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve collections'
        });
    }
});
router.get('/collections/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const info = await qdrantService.getCollectionInfo(name);
        if (!info) {
            return res.status(404).json({
                success: false,
                error: 'Collection not found'
            });
        }
        res.json({
            success: true,
            data: info
        });
    }
    catch (error) {
        console.error('Collection info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve collection info'
        });
    }
});
router.delete('/collections/:name', async (req, res) => {
    try {
        const { name } = req.params;
        await qdrantService.deleteCollection(name);
        res.json({
            success: true,
            message: `Collection '${name}' deleted successfully`
        });
    }
    catch (error) {
        console.error('Collection deletion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete collection'
        });
    }
});
export default router;
//# sourceMappingURL=search.js.map