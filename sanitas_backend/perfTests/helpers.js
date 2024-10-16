/**
 * Creates an Authorization header for the axios library.
 * @param {string} jwt - The JWT token to use for authorization.
 * @returns { {Authorization: string} }
 */
export const createAuthorizationHeader = (jwt) => {
	return { Authorization: jwt };
};

export function genValidUpdateStudentFamilyHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			hypertension: {
				version: 1,
				data: ["Father", "Mother"],
			},
			diabetesMellitus: {
				version: 1,
				data: ["Mother", "Brother"],
			},
			hypothyroidism: {
				version: 1,
				data: ["Grandmother"],
			},
			asthma: {
				version: 1,
				data: [],
			},
			convulsions: {
				version: 1,
				data: ["Uncle"],
			},
			myocardialInfarction: {
				version: 1,
				data: [],
			},
			cancer: {
				version: 1,
				data: [
					{
						who: "Mother",
						typeOfCancer: "Breast",
					},
				],
			},
			cardiacDiseases: {
				version: 1,
				data: [
					{
						who: "Father",
						typeOfDisease: "Hypertrophy",
					},
				],
			},
			renalDiseases: {
				version: 1,
				data: [
					{
						who: "Grandfather",
						typeOfDisease: "Renal Failure",
					},
				],
			},
			others: {
				version: 1,
				data: [
					{
						who: "Brother",
						disease: "Psoriasis",
					},
				],
			},
		},
	};
}

/**
	* The originalPayload format is:
	* ```
{
			cui: generateUniqueCUI(),
			names: "Flabio Andre",
			lastNames: "Galán Dona",
			isWoman: true,
			birthdate: new Date("2003-07-08"),
}
	* ```
	*
	*/
export function genValidUpdateStudentGeneral(patientId, originalPayload) {
	return {
		patientId,
		phone: "5524-2256",
		...originalPayload,
	};
}

export function genValidUpdateStudentPersonal(patientId) {
	return {
		patientId,
		medicalHistory: {
			hypertension: {
				version: 1,
				data: [
					{
						medicine: "Medicina random 1",
						dose: "5ml",
						frequency: "3 veces al día",
					},
					{
						medicine: "Medicina random 2",
						dose: "10ml",
						frequency: "Una vez al día",
					},
				],
			},
			diabetesMellitus: {
				version: 1,
				data: [
					{
						medicine: "Medicina random 4",
						dose: "2 pastillas",
						frequency: "Cada 8 horas",
					},
				],
			},
			hypothyroidism: {
				version: 1,
				data: [
					{
						medicine: "Medicina random 4",
						dose: "2 pastillas",
						frequency: "Cada 8 horas",
					},
				],
			},
			asthma: {
				version: 1,
				data: [
					{
						medicine: "Medicina random 4",
						dose: "2 pastillas",
						frequency: "Cada 8 horas",
					},
				],
			},
			convulsions: {
				version: 1,
				data: [
					{
						medicine: "Medicina random 4",
						dose: "2 pastillas",
						frequency: "Cada 8 horas",
					},
				],
			},
			myocardialInfarction: {
				version: 1,
				data: [
					{
						surgeryYear: 2012,
					},
					{
						surgeryYear: 2013,
					},
				],
			},
			cancer: {
				version: 1,
				data: [
					{
						typeOfCancer: "Breast",
						treatment: "Operation",
					},
				],
			},
			cardiacDiseases: {
				version: 1,
				data: [
					{
						typeOfDisease: "Hypertrophy",
						medicine: "Medicina random 5",
						dose: "5ml",
						frequency: "1 vez al día",
					},
					{
						typeOfDisease: "Hypertrophy 2",
						medicine: "Medicina random 5",
						dose: "5ml",
						frequency: "1 vez al día",
					},
				],
			},
			renalDiseases: {
				version: 1,
				data: [
					{
						typeOfDisease: "Hypertrophy 2",
						medicine: "Medicina random 5",
						dose: "5ml",
						frequency: "1 vez al día",
					},
					{
						typeOfDisease: "Hypertrophy 2",
						medicine: "Medicina random 5",
						dose: "5ml",
						frequency: "1 vez al día",
					},
				],
			},
			others: {
				version: 1,
				data: [
					{
						typeOfDisease: "Hypertrophy 2",
						medicine: "Medicina random 5",
						dose: "5ml",
						frequency: "1 vez al día",
					},
				],
			},
		},
	};
}

export function genValidUpdateStudentAllergic(patientId) {
	return {
		patientId,
		medicalHistory: {
			medication: {
				version: 1,
				data: [
					{
						name: "Ibuprofen",
						severity: "Moderate",
					},
				],
			},
			food: {
				version: 1,
				data: [
					{
						name: "Shrimp",
						severity: "Severe",
					},
				],
			},
			dust: {
				version: 1,
				data: [],
			},
			pollen: {
				version: 1,
				data: [],
			},
			climateChange: {
				version: 1,
				data: [],
			},
			animals: {
				version: 1,
				data: [],
			},
			others: {
				version: 1,
				data: [],
			},
		},
	};
}

export function genValidUpdateStudentSurgicalHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			surgeries: {
				version: 1,
				data: [
					{
						surgeryType: "Appendectomy",
						surgeryYear: "2023",
						complications: "None",
					},
				],
			},
		},
	};
}

export function genValidUpdateStudentTraumatologicalHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			traumas: {
				version: 1,
				data: [
					{
						whichBone: "Femur",
						year: "2023",
						treatment: "Surgery",
					},
				],
			},
		},
	};
}

export function genValidUpdateStudentPsychiatricHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			depression: {
				data: {
					medication: "Antidepressant",
					dose: "20mg",
					frequency: "Daily",
				},
			},
			anxiety: {
				data: {},
			},
			ocd: {
				data: {},
			},
			adhd: {
				data: {},
			},
			bipolar: {
				data: {},
			},
			other: {
				data: {},
			},
		},
	};
}

export function genValidUpdateStudentGynecoHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			firstMenstrualPeriod: {
				version: 1,
				data: { age: 13 },
			},
			regularCycles: {
				version: 1,
				data: { isRegular: true },
			},
			painfulMenstruation: {
				version: 1,
				data: { isPainful: true, medication: "Ibuprofen" },
			},
			pregnancies: {
				version: 1,
				data: {
					totalPregnancies: 2,
					vaginalDeliveries: 1,
					cesareanSections: 1,
					abortions: 0,
				},
			},
			diagnosedIllnesses: {
				version: 1,
				data: {
					ovarianCysts: {
						medication: {
							medication: "Med B",
							dosage: "250mg",
							frequency: "Twice a day",
						},
					},
					uterineMyomatosis: {
						medication: {
							medication: "Med C",
							dosage: "100mg",
							frequency: "Once a day",
						},
					},
					endometriosis: {
						medication: { medication: "", dosage: "", frequency: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				version: 1,
				data: {
					ovarianCystsSurgery: [{ year: 2018, complications: false }],
					hysterectomy: { year: 2019, complications: true },
					sterilizationSurgery: { year: 2021, complications: false },
					breastMassResection: [{ year: 2020, complications: true }],
				},
			},
		},
	};
}

export function genValidUpdateStudentNonPatologicalHistory(patientId) {
	return {
		patientId,
		medicalHistory: {
			bloodType: "A+",
			smoker: {
				currently: true,
				amountPerDay: 10,
			},
			drink: {
				frequently: true,
				type: "Beer",
			},
			drugs: {
				used: false,
			},
		},
	};
}
