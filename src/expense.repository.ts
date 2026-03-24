import type { Expense } from "./expense.schema.js";
import type { Result } from "./result.js";

export interface ExpenseRepository {
    save(expense: Expense): Promise<Result<null, string>>;
}