import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/student/`;

describe("Student Handler", () => {
	const studentId = 1;
	const fakestudentId = 9999;

	it("should return 403 if no CARNET is provided", async () => {
		try {
			await axios.get(API_URL);
		} catch (error) {
			expect(error.response.status).toBe(403);
		}
	});

	it("should return a patient", async () => {
		const response = await axios.get(API_URL + studentId);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const user = response.data;
		expect(user).toBeDefined();
		expect(user.carnet).toBe("A01234567");
		expect(user.career).toBe("Ingeniería en CC y TI");
		expect(user.patientId).toBe(1);
	});

	it("should not found a patiend", async () => {
		try {
			const response = await axios.get(API_URL + fakestudentId);
		} catch (error) {
			expect(error.response.status).toBe(404);
		}
	});
});
