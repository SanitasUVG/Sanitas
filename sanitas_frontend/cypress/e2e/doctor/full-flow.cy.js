import { generateUniqueCUI, randomFrom } from "../../utils/cui";

function closeToastifies() {
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.first()
		.click();
	cy.get("button[class='Toastify__close-button Toastify__close-button--light']")
		.last()
		.click();
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

		// NOTE: Navigate to Family antecedents...
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
		const possibleRelations = ["Abuelo", "Abuela", "Mamá", "Papá", "Hermano"];

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
		const possibleCancers = ["mama", "hueso", "piel"];
		cy.contains("Agregar antecedente familiar").click();
		cy.get("select").select("Cáncer", { timeout: 6000 });
		cy.get(
			"input[placeholder='Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)']",
		).type(randomFrom(possibleRelations));
		cy.get("input[placeholder='Especifique el tipo de cáncer']").type(
			randomFrom(possibleCancers),
		);
		cy.contains("Guardar").click();
		cy.get("@UPDATEFamily")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
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
		cy.get("@UPDATEFamily")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
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
		cy.get("@UPDATEFamily")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
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
		cy.get("@UPDATEFamily")
			.its("response.statusCode")
			.should("be.oneOf", [200]);
		closeToastifies();

		// NOTE: Navigate to Personal antecedents...
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
		const possibleMeds = ["Medicamento 1", "Medicamento 2", "Medicamento 3"];
		const possibleDoses = ["12mg", "2 tabletas", "1ml", "1 cucharada"];
		const possibleFrequencies = [
			"2 veces al día",
			"3 veces a la semana",
			"cada 8 horas",
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
		const possibleDisseases = ["Enfermedad 1", "Enfermedad 2", "Enfermedad 3"];
		personalOptions = [
			"Enfermedades cardiacas",
			"Enfermedades renales",
			"Otros",
		];
		for (const option of personalOptions) {
			cy.contains("Agregar antecedente personal").click();
			cy.get("select").select(option, { timeout: 6000 });
			cy.get("p:contains(¿Qué enfermedad?)+input").type(
				randomFrom(possibleDisseases),
			);
			cy.get("p:contains(Medicamento)+input").type(
				randomFrom(possibleDisseases),
			);
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
	});
});
