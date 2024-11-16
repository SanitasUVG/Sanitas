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

Cypress.Commands.addAll({
	loginAsDoctor,
	loginAsPatient,
});
