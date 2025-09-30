/* eslint-env node */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { connectToDatabase } from './lib/mongoClient.js';
import authRoutes from './routes/auth.js';
import deliveryRequestRoutes from './routes/deliveryRequests.js';
import warehouseRoutes from './routes/warehouses.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : undefined;

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length ? allowedOrigins : undefined
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, _res, next) => {
  req.db = app.get('db');
  next();
});

app.use('/auth', authRoutes);
app.use('/requests', deliveryRequestRoutes);
app.use('/warehouses', warehouseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const db = await connectToDatabase();
    app.set('db', db);

    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
