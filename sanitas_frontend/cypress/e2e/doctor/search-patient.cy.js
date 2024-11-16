describe("Search Patient", () => {
	beforeEach(() => {
		cy.loginAsDoctor();
	});

	it("Searchs by name", () => {
		cy.searchPatient("Nombres y Apellidos", "juan");
	});

	it("Searchs by CUI", () => {
		cy.searchPatient("CUI", "1234567890123");
	});

	it("Searchs by Carnet", () => {
		cy.searchPatient("Carnet Estudiante", "A01234567");
	});

	it("Searchs by Colaborator code", () => {
		cy.searchPatient("Código Colaborador", "C001");
	});
});
