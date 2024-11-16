describe("Search Patient", () => {
	beforeEach(() => {
		cy.loginAsDoctor();
	});

	it("Searchs for a single patient", () => {
		cy.get("input[type=text]", { timeout: 6000 }).type("juan");

		cy.intercept("POST", "**/patient/search").as("searchPatient");
		cy.contains("Buscar Paciente").click("left");
		cy.get("@searchPatient")
			.its("response.statusCode")
			.should("be.oneOf", [200]);

		cy.contains("Ver").click();
	});
});
