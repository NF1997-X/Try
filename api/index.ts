import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Register API routes
let routesRegistered = false;
const initRoutes = async () => {
  if (!routesRegistered) {
    await registerRoutes(app);
    routesRegistered = true;
  }
};

export default async (req: VercelRequest, res: VercelResponse) => {
  await initRoutes();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Convert Vercel request to Express
  return app(req as any, res as any);
};
