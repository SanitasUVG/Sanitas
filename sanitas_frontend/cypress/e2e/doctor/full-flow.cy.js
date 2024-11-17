import {
	generateUniqueCUI,
	randomFrom,
	randomIntBetween,
} from "../../utils/cui";

const possibleRelations = ["Abuelo", "Abuela", "Mamá", "Papá", "Hermano"];
const possibleCancers = ["mama", "hueso", "piel"];
const possibleMeds = ["Medicamento 1", "Medicamento 2", "Medicamento 3"];
const possibleDoses = ["12mg", "2 tabletas", "1ml", "1 cucharada"];
const possibleFrequencies = [
	"2 veces al día",
	"3 veces a la semana",
	"cada 8 horas",
];
const possibleSurgeries = [
	"Operación 1",
	"Operación 2",
	"Operación 3",
	"Operación 4",
];

const allergies = [
	"Medicamentos",
	"Comida",
	"Polvo",
	"Polen",
	"Cambio de Clima",
	"Animales",
	"Otros",
];
const possibleDisseases = ["Enfermedad 1", "Enfermedad 2", "Enfermedad 3"];

function closeToastifies() {
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.first()
		.click();
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.last()
		.click();
}

function fillAllergicAntecedents() {
	cy.intercept("GET", "**/patient/allergic-history/**").as("GETAllergic");
	cy.contains("Alérgicos").click();
	cy.get("@GETAllergic").its("response.statusCode").should("be.oneOf", [200]);

	cy.intercept("PUT", "**/patient/allergic-history").as("UPDATEAllergic");
	for (const option of allergies) {
		cy.contains("Agregar antecedente alérgico").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get("p:contains(¿A cuál?)+input").type(randomFrom(allergies));

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

	cy.intercept("PUT", "**/patient/family-history").as("UPDATEFamily");
	for (const option of familyOptions) {
		cy.contains("Agregar antecedente familiar").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get(
			"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
		).type(randomFrom(possibleRelations));
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
	).type(randomFrom(possibleRelations));
	cy.get("input[placeholder='Especifique el tipo de cáncer']").type(
		randomFrom(possibleCancers),
	);
	cy.contains("Guardar").click();
	cy.get("@UPDATEFamily").its("response.statusCode").should("be.oneOf", [200]);
	closeToastifies();

	// Add heart disease
	cy.contains("Agregar antecedente familiar").click();
	cy.get("select").select("Enfermedades cardiacas", { timeout: 6000 });
	cy.get(
		"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
	).type(randomFrom(possibleRelations));
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
	).type(randomFrom(possibleRelations));
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
	).type(randomFrom(possibleRelations));
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
	cy.intercept("PUT", "**/patient/personal-history").as("UPDATEPersonal");
	for (const option of personalOptions) {
		cy.contains("Agregar antecedente personal").click();
		cy.get("select").select(option, { timeout: 6000 });
		cy.get("p:contains(Medicamento)+input").type(randomFrom(possibleMeds));
		cy.get("p:contains(Dosis)+input").type(randomFrom(possibleDoses));
		cy.get("p:contains(Frecuencia)+input").type(
			randomFrom(possibleFrequencies),
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
	cy.get("p:contains(Tipo)+input").type(randomFrom(possibleCancers));
	cy.get("p:contains(Tratamiento)+input").type(randomFrom(possibleMeds));
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
			randomFrom(possibleDisseases),
		);
		cy.get("p:contains(Medicamento)+input").type(randomFrom(possibleDisseases));
		cy.get("p:contains(Dosis)+input").type(randomFrom(possibleDoses));
		cy.get("p:contains(Frecuencia)+input").type(
			randomFrom(possibleFrequencies),
		);
		cy.contains("Guardar").click();
		cy.get("@UPDATEPersonal")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();
	}
}

function fillSurgicalAntecedents() {
	cy.intercept("GET", "**/patient/surgical-history/**").as("GETSurgical");
	cy.contains("Quirúrgicos").click();
	cy.get("@GETSurgical").its("response.statusCode").should("be.oneOf", [200]);

	cy.intercept("PUT", "**/patient/surgical-history").as("UPDATESurgical");
	const COUNT = 5;
	for (let i = 0; i < COUNT; i++) {
		cy.contains("Agregar antecedente quirúrgico").click();
		cy.get(
			"input[placeholder='Ingrese acá el motivo o tipo de cirugía.']",
		).type(randomFrom(possibleSurgeries));
		cy.get("select").select(`${randomIntBetween(2005, 2015)}`);
		cy.get("p:contains(¿Tuvo alguna complicación?)+input").type(
			randomFrom(allergies),
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

	cy.intercept("PUT", "**/patient/traumatological-history").as(
		"UPDATETraumatological",
	);
	const COUNT = 5;
	for (let i = 0; i < COUNT; i++) {
		cy.contains("Agregar antecedente traumatológico").click();
		cy.get("input[placeholder='Ingrese el hueso fracturado']").type(
			randomFrom(possibleSurgeries),
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
				.type(randomFrom(possibleMeds));
			// cy.get(selectedP).parents().eq(3).find(`p:contains(Dosis ${i + 1})+input`).type(
			// 	randomFrom(possibleDoses),
			// );
			if (Math.random() < 0.5) {
				cy.get(selectedP)
					.parents()
					.eq(3)
					.find(`p:contains(Dosis ${i + 1})+input`)
					.type(randomFrom(possibleDoses));
			}
			cy.get(selectedP)
				.parents()
				.eq(3)
				.find(`p:contains(Frecuencia ${i + 1})+input`)
				.type(randomFrom(possibleFrequencies));
			// cy.get(selectedP).parents().eq(3).find("p:contains(¿Tiene seguimiento en UBE?)+div")
			// 	.contains("Si")
			// 	.find("input")
			// 	.check();
			if (Math.random() < 0.5) {
				cy.get(selectedP)
					.parents()
					.eq(3)
					.find("p:contains(¿Tiene seguimiento en UBE?)+div")
					.contains("Si")
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

	cy.intercept("PUT", "**/patient/psychiatric-history").as("UPDATEPsychiatric");
	cy.contains("Guardar").click();
	cy.get("@UPDATEPsychiatric")
		.its("response.statusCode")
		.should("be.oneOf", [200]);
	closeToastifies();
}

describe("Common doctor actions", () => {
	beforeEach(() => {
		cy.loginAsDoctor();
	});

	it("Create a patient and edit its antecedents", () => {
		const cui = generateUniqueCUI();
		cy.doctorCreatePatient(cui, {
			names: "Pera",
			lastnames: "Marmota",
			isWoman: true,
			birthdate: "2004-07-12",
		});

		// NOTE: The app redirects to UpdateGeneralInformation
		// So we need to wait for the HTTP requests to be done.
		cy.intercept("GET", "**/patient/general/**").as("patientDetails");
		cy.get("@patientDetails")
			.its("response.statusCode")
			.should("be.oneOf", [200]);

		fillFamiliarAntecedents();
		fillPersonalAntecedents();
		fillAllergicAntecedents();
		fillSurgicalAntecedents();
		fillTraumatologicAntecedents();
		fillPsychiatricAntecedents();
	});
});
