import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/patient/";

describe("Get patient integration tests", () => {
  test("Get patient that exists", async () => {
    const response = await axios.get(LOCAL_API_URL + "1");

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const user = JSON.parse(response.data);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.cui).toBe("1234567890123");
    expect(user.email).toBe("juan.perez@example.com");
    expect(user.isWoman).toBe(false);
    expect(user.names).toBe("Juan");
    expect(user.lastnames).toBe("Pérez");

    expect(user.contactName1).toBe("Maria Pérez");
    expect(user.contactKinship1).toBe("Madre");
    expect(user.contactPhone1).toBe("987654321");

    expect(user.contactName2).toBe("Jose Pérez");
    expect(user.contactKinship2).toBe("Padre");
    expect(user.contactPhone2).toBe("987650123");

    expect(user.bloodType).toBe("O+");
    expect(user.address).toBe("Calle Falsa 123, Ciudad");
    expect(user.birthdate).toBe("1990-01-01");
    expect(user.phone).toBe("1234567890");
  });

  test("Fail when retrieving patient that doesn't exists", async () => {
    // Para que axios no lance un error en caso de status >= 400
    const response = await axios.get(LOCAL_API_URL + "10000", { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);

    const { message } = JSON.parse(response.data);
    expect(message).toBe("Invalid request: No patient with the given id found.");
  });
});
