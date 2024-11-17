import {
	POSSIBLE_BLOODTYPE,
	POSSIBLE_NAMES,
	POSSIBLE_RELATIONS,
} from "../../utils/constants";
import {
	generateUniqueCUI,
	randomFrom,
	randomPhone,
	randomIntBetween,
} from "../../utils/cui";

function closeToastifies() {
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.first()
		.click();
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.last()
		.click();
}

function fillGeneralData() {
	cy.intercept("GET", "**/patient/student/**").as("GETStudent");
	cy.get("label:contains(Dirección)+input").type("Ponyville");
	cy.get("label:contains(Tipo de sangre)+div")
		.find("select")
		.select(randomFrom(POSSIBLE_BLOODTYPE));

	// Filling emergency contacts...
	cy.get("input[placeholder='Nombre de contacto']")
		.first()
		.type(randomFrom(POSSIBLE_NAMES));
	cy.get("input[placeholder='Parentesco de contacto']")
		.first()
		.type(randomFrom(POSSIBLE_RELATIONS));
	cy.get("input[placeholder='Teléfono de contacto']")
		.first()
		.type(randomPhone());
	cy.get("input[placeholder='Nombre de contacto']")
		.last()
		.type(randomFrom(POSSIBLE_NAMES));
	cy.get("input[placeholder='Parentesco de contacto']")
		.last()
		.type(randomFrom(POSSIBLE_RELATIONS));
	cy.get("input[placeholder='Teléfono de contacto']")
		.last()
		.type(randomPhone());

	cy.intercept("POST", "**/patient/general").as("UPDATE_PATIENT");
	cy.contains("Guardar").click();
	cy.get("@UPDATE_PATIENT")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	cy.get("@GETStudent").its("response.statusCode").should("be.oneOf", [200]);

	// Fill collaborator data...
	cy.get("label:contains(Código)+input").type(
		`${randomIntBetween(1000, 100000)}`,
	);
	cy.get("label:contains(Área de trabajo)+input").type("Magic");

	cy.intercept("POST", "**/patient/collaborator").as("UPDATECollaborator");
	cy.get("span:contains(Guardar)").eq(1).parent().click();
	cy.get("@UPDATECollaborator")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	cy.get("@GETStudent").its("response.statusCode").should("be.oneOf", [200]);

	// Fill student data...
	cy.get("label:contains(Carnet)+input").type(
		`${randomIntBetween(1000, 100000)}`,
	);
	cy.get("label:contains(Carrera)+input").type("Friendship");

	cy.intercept("POST", "**/patient/student").as("UPDATEStudent");
	cy.get("span:contains(Guardar)").eq(2).parent().click();
	cy.get("@UPDATEStudent").its("response.statusCode").should("be.oneOf", [200]);
	cy.get("@GETStudent").its("response.statusCode").should("be.oneOf", [200]);
}

describe("Patient full flows", () => {
	it("Create an account, patient and fill form", () => {
		const email = "yolej65661@gianes.com";
		const password = "hello123...";

		cy.visit("https://sanitasuvg.github.io/Sanitas");

		// NOTE: Register user...
		cy.contains("Crea una aquí", { timeout: 10_000 }).click();
		cy.get("input[placeholder='Ingrese su correo']").type(email);
		cy.get("input[placeholder='Ingrese su contraseña']").type(password);
		cy.contains("Ingresar").click();

		// NOTE: Login with new user...
		cy.wait(40 * 1000); // Giving time for the email to appear so we can confirm it...
		cy.login(email, password);

		// NOTE: Enter CUI...
		const cui = generateUniqueCUI();
		cy.contains("Continuar", { timeout: 10_000 }).click();
		cy.get("label:contains(Ingrese su CUI)+div").find("input").type(cui);

		// The patient with the CUI should not exist...
		cy.intercept("POST", "**/account/link").as("LINK_ACCOUNT");
		cy.contains("Buscar").click();
		cy.get("@LINK_ACCOUNT")
			.its("response.statusCode")
			.should("be.oneOf", [404]);

		// NOTE: Creating patient...
		cy.get("label:contains(Nombres del paciente)+input").type("Twilight");
		cy.get("label:contains(Apellidos del paciente)+input").type("Sparkle");
		cy.get("label:contains(Fecha de Nacimiento)+input").type("2000-05-01");
		cy.get("label:contains(Teléfono)+input").type(randomPhone());
		cy.get("label:contains(Seguro Médico)+input").type(
			Math.random() < 0.5 ? "El Roble" : "Ninguno",
		);
		cy.get("label:contains(Femenino)>input").check();

		cy.intercept("POST", "**/patient/create").as("CREATE_PATIENT");
		cy.contains("Continuar con el formulario").click();
		cy.get("@CREATE_PATIENT")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		cy.get("@LINK_ACCOUNT")
			.its("response.statusCode")
			.should("be.oneOf", [200]);

		fillGeneralData();
	});
});
