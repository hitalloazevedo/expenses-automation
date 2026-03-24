import type { Pool } from "pg";
import type { ExpenseRepository } from "../expense.repository.js";
import type { Expense } from "./expense.schema.js";
import { err, ok, type Result } from "./result.js";

export class PostgresExpenseRepository implements ExpenseRepository {

    public constructor(private pool: Pool){}

    async save(expense: Expense): Promise<Result<null, 'DATABASE_ERROR'>> {
        const client = await this.pool.connect();
        try {

            await client.query("BEGIN");
        
            const signedAmount = -Math.abs(expense.amount)
        
            // 1. cria transaction
            const txResult = await client.query(
              `INSERT INTO transactions (amount, date)
               VALUES ($1, $2)
               RETURNING id`,
              [signedAmount, expense.date]
            );
        
            const transactionId = txResult.rows[0].id;
        
            // 2. cria expense
            await client.query(
              `INSERT INTO expenses (description, category, id_transaction)
               VALUES ($1, $2, $3)`,
              [expense.description, expense.category, transactionId]
            );
        
            await client.query("COMMIT");
        
            return ok(null);
          } catch (e) {
            console.error("ERRO REAL:", e);
            await client.query("ROLLBACK");
            return err("DATABASE_ERROR");
          } finally {
            client.release();
          }
    }
}