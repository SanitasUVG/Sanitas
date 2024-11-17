import {
	ALLERGIES,
	POSSIBLE_BLOODTYPE,
	POSSIBLE_CANCERS,
	POSSIBLE_DIESEASSES,
	POSSIBLE_DOSES,
	POSSIBLE_FREQUENCIES,
	POSSIBLE_MEDS,
	POSSIBLE_NAMES,
	POSSIBLE_RELATIONS,
	POSSIBLE_SURGERIES,
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

function fillFamiliarAntecedents() {
	cy.intercept("GET", "**/patient/family-history/**").as("GETFamily");
	cy.contains("Familiares").click();
	cy.get("@GETFamily").its("response.statusCode").should("be.oneOf", [200]);

	const familyOptions = [
		"Hipertensión arterial",
		"Diabetes Mellitus",
		"Hipotiroidismo",
		"Asma",
		"Convulsiones",
		"Infarto Agudo de Miocardio",
	];

	cy.intercept("POST", "**/patient/student-family-history").as("UPDATEFamily");
	for (const option of familyOptions) {
		cy.contains("Agregar antecedente familiar").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get(
			"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
		).type(randomFrom(POSSIBLE_RELATIONS));
		cy.contains("Guardar").click();
		cy.get("@UPDATEFamily")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}

	// Add cancer
	cy.contains("Agregar antecedente familiar").click();
	cy.get("select").select("Cáncer", { timeout: 6000 });
	cy.get(
		"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
	).type(randomFrom(POSSIBLE_RELATIONS));
	cy.get("input[placeholder='Especifique un único tipo de cáncer']").type(
		randomFrom(POSSIBLE_CANCERS),
	);
	cy.contains("Guardar").click();
	cy.get("@UPDATEFamily").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();

	// Add heart disease
	cy.contains("Agregar antecedente familiar").click();
	cy.get("select").select("Enfermedades cardiacas", { timeout: 6000 });
	cy.get(
		"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
	).type(randomFrom(POSSIBLE_RELATIONS));
	cy.get(
		"input[placeholder='Especifique el tipo de enfermedad (no obligatorio)']",
	).type(randomFrom(["Enfermedad 1", "arritmia"]));
	cy.contains("Guardar").click();
	cy.get("@UPDATEFamily").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();

	// Add renal disease
	cy.contains("Agregar antecedente familiar").click();
	cy.get("select").select("Enfermedades renales", { timeout: 6000 });
	cy.get(
		"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
	).type(randomFrom(POSSIBLE_RELATIONS));
	cy.get(
		"input[placeholder='Especifique el tipo de enfermedad (no obligatorio)']",
	).type(randomFrom(["quistes", "Enfermedad 2"]));
	cy.contains("Guardar").click();
	cy.get("@UPDATEFamily").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();

	// Other
	cy.contains("Agregar antecedente familiar").click();
	cy.get("select").select("Otros", { timeout: 6000 });
	cy.get(
		"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
	).type(randomFrom(POSSIBLE_RELATIONS));
	cy.get("input[placeholder='Escriba la enfermedad']").type(
		randomFrom(["Enfermedad 1", "Enfermedad 2", "Enfermedad 3"]),
	);
	cy.contains("Guardar").click();
	cy.get("@UPDATEFamily").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();
}

function fillPersonalAntecedents() {
	cy.intercept("GET", "**/patient/personal-history/**").as("GETPersonal");
	cy.contains("Personales").click();
	cy.get("@GETPersonal").its("response.statusCode").should("be.oneOf", [200]);

	let personalOptions = [
		"Hipertensión arterial",
		"Diabetes Mellitus",
		"Hipotiroidismo",
		"Asma",
		"Convulsiones",
	];
	cy.intercept("POST", "**/patient/student-personal-history").as(
		"UPDATEPersonal",
	);
	for (const option of personalOptions) {
		cy.contains("Agregar antecedente personal").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get("p:contains(Medicamento)+input").type(randomFrom(POSSIBLE_MEDS));
		cy.get("p:contains(Dosis)+input").type(randomFrom(POSSIBLE_DOSES));
		cy.get("p:contains(Frecuencia)+input").type(
			randomFrom(POSSIBLE_FREQUENCIES),
		);
		cy.contains("Guardar").click();
		cy.get("@UPDATEPersonal")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}

	// Add acute myocardial infarction
	cy.contains("Agregar antecedente personal").click();
	cy.get("select").select("Infarto Agudo de Miocardio", { timeout: 6000 });
	cy.get("select").last().select("2006");
	cy.contains("Guardar").click();
	cy.get("@UPDATEPersonal")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	closeToastifies();

	// Add cancer
	cy.contains("Agregar antecedente personal").click();
	cy.get("select").select("Cáncer", { timeout: 6000 });
	cy.get("p:contains(Tipo)+input").type(randomFrom(POSSIBLE_CANCERS));
	cy.get("p:contains(Tratamiento)+input").type(randomFrom(POSSIBLE_MEDS));
	cy.contains("Guardar").click();
	cy.get("@UPDATEPersonal")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	closeToastifies();

	// Add last 3 types
	personalOptions = ["Enfermedades cardiacas", "Enfermedades renales", "Otros"];
	for (const option of personalOptions) {
		cy.contains("Agregar antecedente personal").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get("p:contains(¿Qué enfermedad?)+input").type(
			randomFrom(POSSIBLE_DIESEASSES),
		);
		cy.get("p:contains(Medicamento)+input").type(
			randomFrom(POSSIBLE_DIESEASSES),
		);
		cy.get("p:contains(Dosis)+input").type(randomFrom(POSSIBLE_DOSES));
		cy.get("p:contains(Frecuencia)+input").type(
			randomFrom(POSSIBLE_FREQUENCIES),
		);
		cy.contains("Guardar").click();
		cy.get("@UPDATEPersonal")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}
}

function fillAllergicAntecedents() {
	cy.intercept("GET", "**/patient/allergic-history/**").as("GETAllergic");
	cy.contains("Alérgicos").click();
	cy.get("@GETAllergic").its("response.statusCode").should("be.oneOf", [200]);

	cy.intercept("POST", "**/patient/student-allergic-history").as(
		"UPDATEAllergic",
	);
	for (const option of ALLERGIES) {
		cy.contains("Agregar antecedente alérgico").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get("p:contains(¿A cuál?)+input").type(randomFrom(ALLERGIES));

		// cy.contains("Tipo de reacción").parent().contains("Cutánea").find("input").check();
		const rng = Math.random();
		if (rng < 0.33) {
			cy.contains("Tipo de reacción")
				.parent()
				.contains("Cutánea")
				.find("input")
				.check();
		} else if (rng < 0.66) {
			cy.contains("Tipo de reacción")
				.parent()
				.contains("Respiratoria")
				.find("input")
				.check();
		} else {
			cy.contains("Tipo de reacción")
				.parent()
				.contains("Ambos")
				.find("input")
				.check();
		}

		cy.contains("Guardar").click();
		cy.get("@UPDATEAllergic")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}
}

function fillSurgicalAntecedents() {
	cy.intercept("GET", "**/patient/surgical-history/**").as("GETSurgical");
	cy.contains("Quirúrgicos").click();
	cy.get("@GETSurgical").its("response.statusCode").should("be.oneOf", [200]);

	cy.intercept("POST", "**/patient/student-surgical-history").as(
		"UPDATESurgical",
	);
	const COUNT = 5;
	for (let i = 0; i < COUNT; i++) {
		cy.contains("Agregar antecedente quirúrgico").click();
		cy.get("p:contains(¿De qué?)+input").type(randomFrom(POSSIBLE_SURGERIES));
		cy.get("select").select(`${randomIntBetween(2005, 2015)}`);
		cy.get("p:contains(¿Tuvo alguna complicación?)+input").type(
			randomFrom(ALLERGIES),
		);

		cy.contains("Guardar").click();
		cy.get("@UPDATESurgical")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}
}

describe("Patient full flows", () => {
	it("Create an account, patient and fill form", () => {
		const email = "cikok87453@edectus.com";
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
		fillFamiliarAntecedents();
		fillPersonalAntecedents();
		fillAllergicAntecedents();
		fillSurgicalAntecedents();
	});
});
