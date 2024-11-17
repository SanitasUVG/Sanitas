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

function fillTraumatologicAntecedents() {
	cy.intercept("GET", "**/patient/traumatological-history/**").as(
		"GETTraumatological",
	);
	cy.contains("Traumatológicos").click();
	cy.get("@GETTraumatological")
		.its("response.statusCode")
		.should("be.oneOf", [200]);

	cy.intercept("POST", "**/patient/student-traumatological-history").as(
		"UPDATETraumatological",
	);
	const COUNT = 5;
	for (let i = 0; i < COUNT; i++) {
		cy.contains("Agregar antecedente traumatológico").click();
		cy.get("p:contains(¿Qué hueso se ha fracturado?)+input").type(
			randomFrom(POSSIBLE_SURGERIES),
		);
		cy.get("select").select(`${randomIntBetween(2005, 2015)}`);

		if (Math.random() < 0.5) {
			cy.get("p:contains(¿Qué tipo de tratamiento tuvo?)+div")
				.contains("Cirugía")
				.find("input")
				.check();
		} else {
			cy.get("p:contains(¿Qué tipo de tratamiento tuvo?)+div")
				.contains("Conservador")
				.find("input")
				.check();
		}

		cy.contains("Guardar").click();
		cy.get("@UPDATETraumatological")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}
}

function fillPsychiatricAntecedents() {
	cy.intercept("GET", "**/patient/psychiatric-history/**").as("GETPsychiatric");
	cy.contains("Psiquiátricos").click();
	cy.get("@GETPsychiatric")
		.its("response.statusCode")
		.should("be.oneOf", [200]);

	const COUNT = 3;
	for (const option of [
		"¿Tiene depresión?",
		"¿Tiene ansiedad?",
		"¿Tiene TOC",
		"¿Tiene TDAH",
		"¿Tiene Trastorno Bipolar?",
	]) {
		const selectedP = `p:contains(${option})`;
		cy.get(`${selectedP}+div`).contains("Sí").find("input").check();

		for (let i = 0; i < COUNT; i++) {
			cy.get(selectedP)
				.parents()
				.eq(3)
				.find(`p:contains(Medicamento ${i + 1})+input`)
				.type(randomFrom(POSSIBLE_MEDS));
			if (Math.random() < 0.5) {
				cy.get(selectedP)
					.parents()
					.eq(3)
					.find(`p:contains(Dosis ${i + 1})+input`)
					.type(randomFrom(POSSIBLE_DOSES));
			}
			cy.get(selectedP)
				.parents()
				.eq(3)
				.find(`p:contains(Frecuencia ${i + 1})+input`)
				.type(randomFrom(POSSIBLE_FREQUENCIES));
			if (Math.random() < 0.5) {
				cy.get(selectedP)
					.parents()
					.eq(3)
					.find("p:contains(¿Tiene seguimiento en UBE?)+div")
					.contains("Sí")
					.find("input")
					.check();
			}

			const isLastRun = i !== COUNT - 1;
			if (isLastRun) {
				cy.get(selectedP)
					.parents()
					.eq(3)
					.find("button>span:contains(Agregar otro medicamento)")
					.click();
			}
		}
	}

	cy.intercept("POST", "**/patient/student-psychiatric-history").as(
		"UPDATEPsychiatric",
	);
	cy.contains("Guardar").click();
	cy.get("@UPDATEPsychiatric")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	closeToastifies();
}

function fillGinecoAntecedents() {
	cy.intercept("GET", "**/patient/gyneco-history/**").as("GETGyneco");
	cy.contains("Ginecoobstétricos").click();
	cy.get("@GETGyneco").its("response.statusCode").should("be.oneOf", [200]);

	cy.get("input[placeholder='Ingrese la edad (Ej. 15, 16...)']").type(
		`${randomIntBetween(12, 16)}`,
	);
	cy.get("p:contains(Sus ciclos son regulares)+div")
		.find("label:contains(Sí)>input")
		.check();
	cy.get("p:contains(Normalmente tiene menstruación dolorosa)+div")
		.find("label:contains(Sí)>input")
		.check();
	cy.get(
		"input[placeholder='Ingrese el medicamento tomado para regular los dolores de menstruación.']",
	).type(randomFrom(POSSIBLE_MEDS));

	cy.get("p:contains(Partos vaginales)+input").type(randomIntBetween(0, 5));
	cy.get("p:contains(Cesáreas)+input").type(randomIntBetween(0, 5));
	cy.get("p:contains(Abortos)+input").type(randomIntBetween(0, 5));

	// NOTE: Diagnóstico por Enfermedades...
	for (const parentText of [
		"Diagnóstico por Quistes Ováricos:",
		"Diagnóstico por Miomatosis Uterina:",
		"Diagnóstico por Endometriosis:",
	]) {
		const parent = `p:contains(${parentText})`;
		cy.get(`${parent}+div`).find("label:contains(Sí)>input").check();

		cy.get(parent)
			.parent()
			.find("p:contains(Medicamento)+input")
			.type(randomFrom(POSSIBLE_MEDS));
		cy.get(parent)
			.parent()
			.find("p:contains(Dosis)+input")
			.type(randomFrom(POSSIBLE_DOSES));
		cy.get(parent)
			.parent()
			.find("p:contains(Frecuencia)+input")
			.type(randomFrom(POSSIBLE_FREQUENCIES));
	}

	const COUNT = 3;
	for (let i = 0; i < COUNT; i++) {
		cy.contains("Agregar otro diagnóstico").click();

		const parentText = `Nuevo Diagnóstico ${i + 4}`;
		const parent = `p:contains(${parentText})`;

		cy.get(parent)
			.parent()
			.find("p:contains(Nombre del diagnóstico)+input")
			.type(randomFrom(POSSIBLE_DIESEASSES));
		cy.get(parent)
			.parent()
			.find("p:contains(Medicamento)+input")
			.type(randomFrom(POSSIBLE_MEDS));
		cy.get(parent)
			.parent()
			.find("p:contains(Dosis)+input")
			.type(randomFrom(POSSIBLE_DOSES));
		cy.get(parent)
			.parent()
			.find("p:contains(Frecuencia)+input")
			.type(randomFrom(POSSIBLE_FREQUENCIES));
	}

	// NOTE: Operaciones del Paciente...
	for (const parentText of [
		"Operación por Histerectomía:",
		"Cirugía para no tener más hijos:",
	]) {
		const parent = `p:contains(${parentText})`;
		cy.get(`${parent}+div`).find("label:contains(Sí)>input").check();

		cy.get(parent)
			.parent()
			.find("select")
			.select(`${randomIntBetween(2010, 2020)}`);
		cy.get(parent)
			.parent()
			.find("p:contains(¿Tuvo alguna complicación?)+div")
			.find("label:contains(Sí)>input")
			.check();
	}

	for (const parentText of [
		"Operación por Quistes Ováricos:",
		"Operación por Resección de masas en mamas:",
	]) {
		const parent = `p:contains(${parentText})`;
		cy.get(`${parent}+div`).find("label:contains(Sí)>input").check();

		cy.get(parent)
			.parent()
			.find("select")
			.select(`${randomIntBetween(2010, 2020)}`);
		cy.get(parent)
			.parent()
			.find("p:contains(¿Tuvo alguna complicación?)+div")
			.find("label:contains(Sí)>input")
			.check();

		cy.get(parent).parent().contains("Agregar otra operación").parent().click();

		cy.get(parent)
			.parent()
			.find("select")
			.last()
			.select(`${randomIntBetween(2010, 2020)}`);
		cy.get(parent)
			.parent()
			.find("p:contains(¿Tuvo alguna complicación?)+div")
			.last()
			.find("label:contains(Sí)>input")
			.check();
	}

	cy.intercept("POST", " **/patient/student-gyneco-history").as("UPDATEGyneco");
	cy.contains("Guardar").click();
	cy.get("@UPDATEGyneco").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();
}

function fillNonPatologicAntecedents() {
	cy.intercept("GET", "**/patient/nonpatological-history/**").as(
		"GETNonpatological",
	);
	cy.contains("No Patológicos").click();
	cy.get("@GETNonpatological")
		.its("response.statusCode")
		.should("be.oneOf", [200]);

	cy.get("p:contains(¿Fuma?)+div").find("label:contains(Sí)>input").check();
	cy.get("input[placeholder='Ingrese cuántos cigarrillos al día']").type(
		randomIntBetween(3, 11),
	);
	cy.get("input[placeholder='Ingrese desde hace cuántos años']").type(
		randomIntBetween(3, 11),
	);

	cy.get("p:contains(¿Consumes bebidas alcohólicas?)+div")
		.find("label:contains(Sí)>input")
		.check();
	cy.get("input[placeholder='Ingrese cuántas bebidas al mes']").type(
		randomIntBetween(10, 20),
	);

	cy.get("p:contains(¿Consumes alguna droga?)+div")
		.find("label:contains(Sí)>input")
		.check();
	cy.get("input[placeholder='Ingrese el tipo de droga']").type(
		randomFrom(["LSD", "Marihuana", "Cocaína"]),
	);
	cy.get("input[placeholder='Ingrese la frecuencia del consumo']").type(
		randomFrom(POSSIBLE_FREQUENCIES),
	);

	cy.intercept("POST", "**/patient/student-nonpatological-history").as(
		"UPDATENonpatological",
	);
	cy.contains("Guardar").click();
	cy.get("@UPDATENonpatological")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	closeToastifies();
}

describe("Patient full flows", () => {
	it("Create an account, patient and fill form", () => {
		const email = "nikomob915@anypng.com";
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
		fillTraumatologicAntecedents();
		fillPsychiatricAntecedents();
		fillGinecoAntecedents();
		fillNonPatologicAntecedents();
	});
});
