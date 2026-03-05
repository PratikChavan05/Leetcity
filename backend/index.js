import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './db/db.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';

dotenv.config();
const port = process.env.PORT || 5005;

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5176',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/city', leetcodeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`🏙️  LeetCity server running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });