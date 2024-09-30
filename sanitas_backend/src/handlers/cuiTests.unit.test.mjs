import { describe, test, expect } from "@jest/globals";
import { cuiIsValid } from "../../layers/utils/utils/cui.mjs";
import { generateUniqueCUI } from "./testHelpers.mjs";

describe("CUI unit tests", () => {
	test("Validates CUI", async () => {
		expect(cuiIsValid("2987944380208")).toBe(true);
		expect(cuiIsValid("2987 94438 0208")).toBe(true);
	});

	test("Can generate valid CUI", async () => {
		const set = new Set();
		// It should be able to generate a thousand CUIs without colliding
		for (let i = 0; i < 1000; i++) {
			// console.log("Starting new one----")
			const cui = generateUniqueCUI();
			expect(set.has(cui)).toBe(false);
			set.add(cui);

			const isValid = cuiIsValid(cui);
			if (isValid.error) {
				console.log("Generated CUI", cui);
			}

			expect(isValid).toBe(true);
		}
	});
});
