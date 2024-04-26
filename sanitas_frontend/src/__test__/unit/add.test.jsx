import { describe, expect, test } from "vitest";
import add from "../../utils/add";

describe("Add function", () => {
  test("Adds two numbers correctly", () => {
    expect(add(1, 1)).toBe(2);
  });
});
