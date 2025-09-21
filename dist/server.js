import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/search.js';
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api/search', searchRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Perplexity Clone Backend is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Perplexity Clone Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 API endpoint: http://localhost:${PORT}/api/search`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=server.js.map