import { tool } from '@openai/agents';
import { z } from 'zod';
import fs from 'fs';
import pdf from 'pdf-parse';
export const pdfReaderTool = tool({
    name: 'pdf_reader',
    description: 'Extract and read text content from PDF files',
    parameters: z.object({
        file_path: z.string().describe('Path to the PDF file'),
        page_range: z.object({
            start: z.number().nullable(),
            end: z.number().nullable()
        }).nullable().optional().describe('Optional page range to extract')
    }),
    async execute({ file_path, page_range }) {
        try {
            if (!fs.existsSync(file_path)) {
                return {
                    content: '',
                    error: `PDF file not found: ${file_path}`,
                    file_path,
                    timestamp: new Date().toISOString()
                };
            }
            const dataBuffer = fs.readFileSync(file_path);
            const data = await pdf(dataBuffer);
            let text = data.text;
            // If page range specified, extract specific pages
            if (page_range) {
                const pages = text.split('\n\n'); // Simple page separation
                const start = page_range.start || 0;
                const end = page_range.end || pages.length;
                text = pages.slice(start, end).join('\n\n');
            }
            return {
                content: text,
                metadata: {
                    total_pages: data.numpages,
                    file_path,
                    extracted_pages: page_range || { start: 0, end: data.numpages },
                    file_size: fs.statSync(file_path).size
                },
                type: 'pdf',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('PDF reading error:', error);
            return {
                content: '',
                error: `Failed to read PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                file_path,
                timestamp: new Date().toISOString()
            };
        }
    }
});
//# sourceMappingURL=pdfReaderTool.js.map