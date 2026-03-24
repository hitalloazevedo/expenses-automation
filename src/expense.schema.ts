import { z } from "zod";

export const expenseCategories = [
  "fast food",
  "supermarket",
  "entertainment",
  "self care",
  "education",
  "other",
  "motorbike maintenance",
  "clothes"
] as const;

export const categoryEnum = z.enum(expenseCategories);

export const createExpenseDtoSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),

  description: z.string().trim().min(1, "Description is required"),

  category: categoryEnum,

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-mm-dd format")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid date",
    })
    .optional(),
});

export const expenseSchema = createExpenseDtoSchema.extend({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid date",
    }),
});

export type Category = z.infer<typeof categoryEnum>;
export type CreateExpenseDto = z.infer<typeof createExpenseDtoSchema>;
export type Expense = z.infer<typeof expenseSchema>;
