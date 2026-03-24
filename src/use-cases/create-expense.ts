import { PostgresExpenseRepository } from "../expense.postgres.js";
import { createExpenseDtoSchema } from "../expense.schema.js";
import { pool } from "../infra/db.js";
import { ok, err, type Result } from "../src/result.js";

export type CreateExpenseError =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR";

export type CreateExpenseResult = Result<null, CreateExpenseError>;

export async function createExpense(
  expense: unknown
): Promise<CreateExpenseResult> {

  const repo = new PostgresExpenseRepository(pool);

  const parsed = createExpenseDtoSchema.safeParse(expense);

  if (!parsed.success) {
    return err("VALIDATION_ERROR");
  }

  const data = parsed.data;
  const date =
    data.date ?? new Date().toISOString().slice(0, 10)

  const { success } = await repo.save({ 
    amount: data.amount,
    category: data.category,
    date,
    description: data.description
  })

  if (!success){
    return err('VALIDATION_ERROR')
  }

  return ok(null)

}