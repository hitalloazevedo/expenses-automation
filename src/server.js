import Fastify from 'fastify';
import { appendRow } from './sheets.js';
import { configDotenv } from 'dotenv';
import { Logger } from './logger.js';

configDotenv();

const app = Fastify();

const categories = new Map([
    ['en', 'Entertainment'],
    ['sf', 'Supermarket'],
    ['ff', 'Fast Food'],
    ['ch', 'Charity'],
    ['he', 'Self Care'],
    ['ed', 'Education'],
    ['mt', 'Motorbike Maintenance'],
    ['cl', 'Clothes'],
    ['ot', 'Other']
]);

function getTodayYYYYMMDD() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const logger = Logger();

app.post('/expenses', async (request, reply) => {

    const token = request.headers.authorization;

    if (token !== process.env.TOKEN) {
        logger.error('Unauthorized access attempt');
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { category, amount, date, description } = request.body;

    if (!category) {
        logger.error('Category is required');
        return reply.code(400).send({ error: 'Category is required' });
    }

    const categoryCode = String(category.toLowerCase().trim());

    const categoryName = categories.get(categoryCode, null);

    if (!categoryName) {
        logger.error('Invalid category');
        return reply.code(400).send({ error: 'Invalid category' });
    }
    
    if (amount <= 0) {
        logger.error('Invalid amount');
        return reply.code(400).send({ error: 'Invalid amount' });
    }
    
    await appendRow([categoryName, amount, date ? date : getTodayYYYYMMDD(), description]);

    const expense = {
        categoryName,
        amount,
        date,
        description
    };

    logger.info(`New expense recorded: ${JSON.stringify(expense)}`);

    return reply.code(201).send({ status: 'new expense recorded' });
});

app.listen({ 
    port: Number.parseInt(process.env.PORT, 10), 
    host: '0.0.0.0' }, 
    () => console.log(`Server listening on port ${process.env.PORT}`
));
