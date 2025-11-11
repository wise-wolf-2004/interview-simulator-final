import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, isMongoDBConnected } from './config/database.js';
import apiRoutes from './routes/api.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB (optional)
connectDatabase();

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: isMongoDBConnected() ? 'MongoDB' : 'In-Memory',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Storage: ${isMongoDBConnected() ? 'MongoDB (Persistent)' : 'In-Memory (Temporary)'}`);
});
