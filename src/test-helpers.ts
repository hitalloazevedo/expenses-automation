import { expect } from "vitest";

/**
 * Assert success (narrows type)
 */
export function expectSuccess<T>(
  result: { success: boolean } & ({ data: T } | { error: unknown })
): asserts result is { success: true; data: T } {
  expect(result.success).toBe(true);
}

/**
 * Assert error (narrows type)
 */
export function expectError<E>(
  result: { success: boolean } & ({ error: E } | { data: unknown })
): asserts result is { success: false; error: E } {
  expect(result.success).toBe(false);
}