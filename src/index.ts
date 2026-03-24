import Fastify from 'fastify'
import { createExpense } from '../use-cases/create-expense.js'
const fastify = Fastify({
  logger: true
})

fastify.post('/expense', async function handler (request, reply) {
  console.log("chegou")
    const { success } = await createExpense(request.body);

    if (!success) return reply.status(400).send({ message: 'error to create expense' })
    
    return { message: 'expense created' }
})

try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}