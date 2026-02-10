import Fastify from 'fastify';
import { appendRow } from './sheets.js';
import { configDotenv } from 'dotenv';

configDotenv();

const app = Fastify();

const categories = new Map([
    ['en', 'entertainment'],
    ['sf', 'supermarket'],
    ['ff', 'fast food'],
    ['ch', 'charity'],
    ['he', 'self care'],
    ['ed', 'education'],
    ['mt', 'motorbike maintenance'],
    ['cl', 'clothes'],
    ['ot', 'other']
]);

function getTodayYYYYMMDD() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

app.post('/expenses', async (request, reply) => {

    const token = request.headers.authorization;

    if (token !== process.env.TOKEN) return reply.code(401).send({ error: 'Unauthorized' });

    const { category, amount, date, description } = request.body;

    if (!category) return reply.code(400).send({ error: 'Category is required' });

    const categoryCode = String(category.toLowerCase().trim());

    const categoryName = categories.get(categoryCode, null);

    if (!categoryName) return reply.code(400).send({ error: 'Invalid category' });
    
    if (amount <= 0) return reply.code(400).send({ error: 'Invalid amount' });
    
    await appendRow([categoryName, amount, date ? date : getTodayYYYYMMDD(), description]);

    return reply.code(201).send({ status: 'new expense recorded' });
});

app.listen({ port: 80, host: '0.0.0.0' }, () => console.log('Server listening on port 80'));
