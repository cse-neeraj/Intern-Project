import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Force override of environment variables ONLY in development
// This fixes local issues where terminal session has stale vars, 
// but respects production environment variables.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ override: true });
    console.log("✅ Custom Env Loader: Local environment variables loaded (Override Enabled)");
} else {
    // In production, let the system environment variables take precedence
    dotenv.config();
    console.log("✅ Custom Env Loader: Production environment detected");
}

// Log masked values for debugging safely
console.log(`Backend URL: ${process.env.BACKEND_URL ? 'Set' : 'Not Set'}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL ? 'Set' : 'Not Set'}`);
