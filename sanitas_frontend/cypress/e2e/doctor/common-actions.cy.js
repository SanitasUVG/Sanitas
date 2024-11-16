import { generateUniqueCUI, randomFrom, randomPhone } from "../../utils/cui";

describe("Common doctor actions", () => {
	beforeEach(() => {
		cy.loginAsDoctor();
	});

	it("Create a patient", () => {
		cy.searchPatient("CUI", generateUniqueCUI());

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

	it("Can edit general data", () => {
		cy.searchPatient("Nombres y Apellidos", "juan");

		cy.intercept("GET", "**/patient/general/**").as("patientDetails");
		cy.contains("Ver").click();
		cy.get("@patientDetails")
			.its("response.statusCode")
			.should("be.oneOf", [200]);

		// NOTE: Start editing
		cy.get("div>h1:contains(Datos Generales)").parent().find("button").click();

		// NOTE: Changing the phone
		cy.get("div>label:contains(Teléfono)")
			.first()
			.parent()
			.find("input")
			.clear()
			.type(randomPhone());

		// NOTE: Changing the insurance name
		cy.get("div>label:contains(Seguro Médico)")
			.parent()
			.find("input")
			.clear()
			.type(randomFrom(["Ninguno", "Seguros G&T"]));

		// NOTE: Changing emergency contacts
		const emergencyContacts = [
			{ name: "María Lucía", relation: "Madre", phone: randomPhone() },
			{ name: "Pedro Escalante", relation: "Abuelo", phone: randomPhone() },
			{ name: "Usul Marco", relation: "Hermano", phone: randomPhone() },
		];

		const contact1 = randomFrom(emergencyContacts);
		cy.get("input[placeholder='Ingrese el nombre del contacto']")
			.first()
			.clear()
			.type(contact1.name);
		cy.get("input[placeholder='Ingrese el parentesco del contacto']")
			.first()
			.clear()
			.type(contact1.relation);
		cy.get("label:contains(Teléfono de contacto)+input")
			.first()
			.clear()
			.type(contact1.phone);

		const contact2 = randomFrom(emergencyContacts);
		cy.get("input[placeholder='Ingrese el nombre del contacto']")
			.last()
			.clear()
			.type(contact2.name);
		cy.get("input[placeholder='Ingrese el parentesco del contacto']")
			.last()
			.clear()
			.type(contact2.relation);
		cy.get("label:contains(Teléfono de contacto)+input")
			.last()
			.clear()
			.type(contact2.phone);

		// NOTE: End editing
		cy.intercept("PUT", "**/patient/general").as("updatePatientDetails");
		cy.get("h1:contains(Datos Generales)+div").find("button").first().click();
		cy.get("@updatePatientDetails")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
	});
});
