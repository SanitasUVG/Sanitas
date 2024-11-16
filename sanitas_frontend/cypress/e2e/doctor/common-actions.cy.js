import { generateUniqueCUI } from "../../utils/cui";

describe("Common doctor actions", () => {
	beforeEach(() => {
		cy.loginAsDoctor();
	});

	it("Create a patient", () => {
		cy.get("select", { timeout: 6000 }).select("CUI");
		cy.get("input[type=text]").type(generateUniqueCUI());

		cy.intercept("POST", "**/patient/search").as("searchPatient");
		cy.contains("Buscar Paciente").click("left");
		cy.get("@searchPatient")
			.its("response.statusCode")
			.should("be.oneOf", [200]);

		cy.contains("Ingresar la información del paciente.").click();
		cy.get("input[placeholder=Nombres]").type("Juana Marcos");
		cy.get("input[placeholder=Apellidos]").type("de la Vega");
		cy.get("input[type=radio]").first().check();
		cy.get("input[type=date]").type("2003-08-07");

		cy.intercept("POST", "**/patient").as("submitPatient");
		cy.get("button").click();
		cy.get("@submitPatient")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
	});
});
