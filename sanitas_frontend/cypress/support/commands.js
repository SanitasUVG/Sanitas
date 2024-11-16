// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const BASE_URL = "https://sanitasuvg.github.io/Sanitas";

/**
 * @param {string} username - The email to login
 * @param {string} password - The password of the user
 */
function login(username, password) {
	cy.visit(BASE_URL);
	cy.get('input[placeholder="Ingrese su correo"]', { timeout: 10000 }).type(
		username,
	);
	cy.get("input[type=password]").type(password);

	cy.wait(200); // NOTE: Wait for React to change states...
	cy.get("button").click();
}

function loginAsDoctor() {
	login("elrohirgt@gmail.com", "galand0nis");
}

function loginAsPatient() {
	login("gal22386@uvg.edu.gt", "galand0nis");
}

/**
 * Search for a patient in the application.
 * Requirements:
 * - We need to be logged in as a doctor.
 *
 * It ends when the HTTP call to search for the patient ends.
 * So you still need to make the action of clicking the "Ver" button.
 * @param {string} query - The string to input on the search box.
 * @param {"CUI" | "Nombres y Apellidos" | "Carnet Estudiante" | "Código Colaborador"} typeOfSearch
 */
function searchPatient(typeOfSearch, query) {
	cy.get("select", { timeout: 6000 }).select(typeOfSearch);
	cy.get("input[type=text]").type(query);

	cy.intercept("POST", "**/patient/search").as("searchPatient");
	cy.contains("Buscar Paciente").click("left");
	cy.get("@searchPatient").its("response.statusCode").should("be.oneOf", [200]);
}

/**
 * Creates a patient as a doctor.
 * Requirements:
 * - Login as a doctor.
 *
 * It ends when a the HTTP request to create a patient is successful!
 * @param {string} cui - Can be generated using the `generateUniqueCUI` function.
 * @param {{names: string, lastnames: string, isWoman: boolean, birthdate: string}} patientInfo - The date must be in the format of "YYYY-MM-DD"
 */
function doctorCreatePatient(cui, patientInfo) {
	cy.searchPatient("CUI", cui);

	cy.contains("Ingresar la información del paciente.").click();
	cy.get("input[placeholder=Nombres]").type(patientInfo.names);
	cy.get("input[placeholder=Apellidos]").type(patientInfo.lastnames);

	if (patientInfo.isWoman) {
		cy.get("input[type=radio]").first().check();
	} else {
		cy.get("input[type=radio]").last().check();
	}

	cy.get("input[type=date]").type(patientInfo.birthdate);

	cy.intercept("POST", "**/patient").as("submitPatient");
	cy.get("button").click();
	cy.get("@submitPatient").its("response.statusCode").should("be.oneOf", [200]);
}

Cypress.Commands.addAll({
	loginAsDoctor,
	loginAsPatient,
	searchPatient,
	doctorCreatePatient,
});
