import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force override of environment variables
// This fixes issues where the terminal session has stale production variables
dotenv.config({ override: true });

console.log("✅ Custom Env Loader: Environment variables loaded (Override Enabled)");
console.log(`Backend URL: ${process.env.BACKEND_URL}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
