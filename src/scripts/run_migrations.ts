import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files (local first, then default)
const envs = ['.env', '.env.local'];
envs.forEach(file => {
    const envPath = path.resolve(__dirname, '../../', file);
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                // Only set if not already set (or override? Next.js usually overrides with local)
                // Actually usually local overrides env.
                process.env[key] = value;
                console.log(`Loaded from ${file}: ${key}`);
            }
        });
    } else {
        console.log(`${file} not found`);
    }
});

// Set dummy secret if missing to bypass validation (safe for RLS migration)
if (!process.env.PAYLOAD_SECRET) {
    console.log('Injecting dummy PAYLOAD_SECRET for migration...');
    process.env.PAYLOAD_SECRET = 'temporary-secret-for-migration-runner';
}

// Dynamic imports to ensure env is loaded first
const { default: config } = await import('../payload.config');
const { getPayload } = await import('payload');

async function run() {
    try {
        const payload = await getPayload({ config });
        console.log('Connected to Payload. Running migrations...');
        await payload.db.migrate();
        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
