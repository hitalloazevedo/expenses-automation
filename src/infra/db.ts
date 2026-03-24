import { Pool } from 'pg';
import { config } from './env.js';

const pool = new Pool({
    connectionString: config.database.url
});

export { pool };