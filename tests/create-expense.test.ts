import { describe, it, expect, vi, beforeEach } from "vitest";
import { createExpense } from "../src/use-cases/create-expense.js";
import { pool } from "../src/infra/db.js";
import { expectSuccess, expectError } from "../src/test-helpers.js";

const { mockConnect, mockQuery, mockRelease } = vi.hoisted(() => ({
  mockConnect: vi.fn(),
  mockQuery: vi.fn(),
  mockRelease: vi.fn(),
}));

vi.mock("../src/infra/db.js", () => ({
  pool: {
    connect: mockConnect,
  },
}));

describe("createExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockConnect.mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    });

    mockQuery.mockImplementation(async (sql: string) => {
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
        return { rows: [], rowCount: null };
      }

      if (sql.includes("INSERT INTO transactions")) {
        return { rows: [{ id: 1 }], rowCount: 1 };
      }

      if (sql.includes("INSERT INTO expenses")) {
        return { rows: [], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    });
  });

  it("should insert a valid expense", async () => {
    const result = await createExpense({
      amount: 100,
      description: "Lunch",
      category: "food",
      date: "2026-03-23",
    });

    expectSuccess(result);
    expect(pool.connect).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO transactions"),
      [-100, "2026-03-23"]
    );
    expect(mockQuery).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO expenses"),
      ["Lunch", "food", 1]
    );
    expect(mockQuery).toHaveBeenNthCalledWith(4, "COMMIT");
    expect(mockRelease).toHaveBeenCalled();
  });

  it("should reject invalid category", async () => {
    const result = await createExpense({
      amount: 100,
      description: "Invalid",
      category: "transport",
    });

    expectError(result);
    expect(result.error).toBe("VALIDATION_ERROR");
    expect(pool.connect).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should use today's date if not provided", async () => {
    const today = new Date().toISOString().slice(0, 10);

    const result = await createExpense({
      amount: 50,
      description: "Groceries",
      category: "supermarket",
    });

    expectSuccess(result);

    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO transactions"),
      [-50, today]
    );
    expect(mockQuery).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO expenses"),
      ["Groceries", "supermarket", 1]
    );
  });

  it("should reject negative amount", async () => {
    const result = await createExpense({
      amount: -30,
      description: "Refund",
      category: "other",
    });

    expectError(result);
    expect(result.error).toBe("VALIDATION_ERROR");
    expect(pool.connect).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should reject zero amount", async () => {
    const result = await createExpense({
      amount: 0,
      description: "Invalid",
      category: "food",
    });

    expectError(result);
    expect(result.error).toBe("VALIDATION_ERROR");
    expect(pool.connect).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});