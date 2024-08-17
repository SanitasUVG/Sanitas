/**
 * @typedef {Object} SurgicalDataItem
 * @property {string} surgeryType - The type of surgery.
 * @property {string} surgeryYear - The year of surgery.
 * @property {string} complications - The complications that arouse when the surgery was performed..
 */

/**
 * @typedef {Object} SurgicalHistory
 * @property {import("./index.mjs").APIMedicalHistoryItem<SurgicalDataItem[]>} surgeries
 */

/**
 * @typedef {import("./index.mjs").APIMedicalHistory<SurgicalHistory>} APISurgicalHistory
 */

/**
 * Generates the default value for a surgical history in the DB.
 * @returns {SurgicalHistory}
 */
export const genDefaultSurgicalHistory = () => ({
	surgeries: {
		version: 1,
		data: [],
	},
});

/**
 * @typedef {import("./index.mjs").FamiliarMedicalHistory} FamiliarMedicalHistory
 */

/**
 * Generates the default value for a surgical history in the DB.
 * @returns {FamiliarMedicalHistory}
 */
export const genDefaultFamiliarHistory = () => ({
	hypertension: {
		version: 1,
		data: [],
	},
	diabetesMellitus: {
		version: 1,
		data: [],
	},
	hypothyroidism: {
		version: 1,
		data: [],
	},
	asthma: {
		version: 1,
		data: [],
	},
	convulsions: {
		version: 1,
		data: [],
	},
	myocardialInfarction: {
		version: 1,
		data: [],
	},
	cancer: {
		version: 1,
		data: [],
	},
	cardiacDiseases: {
		version: 1,
		data: [],
	},
	renalDiseases: {
		version: 1,
		data: [],
	},
	others: {
		version: 1,
		data: [],
	},
});

/**
 * @typedef {import("./index.mjs").TraumatologicMedicalHistory} TraumatologicalHistory
 */

/**
 * Generates the default value for a surgical history in the DB.
 * @returns {TraumatologicalHistory}
 */

export const genDefaultTraumatologicalHistory = () => ({
	traumas: {
		version: 1,
		data: [],
	},
});

/**
 * Generates the default value for a personal medical history in the DB.
 * @returns {import("./index.mjs").PersonalMedicalHistory}
 */
export const genDefaultPersonalHistory = () => ({
	hypertension: {
		version: 1,
		data: [],
	},
	diabetesMellitus: {
		version: 1,
		data: [],
	},
	hypothyroidism: {
		version: 1,
		data: [],
	},
	asthma: {
		version: 1,
		data: [],
	},
	convulsions: {
		version: 1,
		data: [],
	},
	myocardialInfarction: {
		version: 1,
		data: [],
	},
	cancer: {
		version: 1,
		data: [],
	},
	cardiacDiseases: {
		version: 1,
		data: [],
	},
	renalDiseases: {
		version: 1,
		data: [],
	},
	others: {
		version: 1,
		data: [],
	},
});

/**
 * @typedef {Object} DefaultNonPathologicalHistory
 * @property {string} bloodType - The default blood type value.
 * @property {Object} smoker - Details about smoking habits.
 * @property {number} smoker.version - Version number of the smoker data format.
 * @property {Array} smoker.data - Data about smoking habits.
 * @property {Object} drink - Details about alcohol consumption.
 * @property {number} drink.version - Version number of the drink data format.
 * @property {Array} drink.data - Data about alcohol consumption.
 * @property {Object} drugs - Details about drug use.
 * @property {number} drugs.version - Version number of the drugs data format.
 * @property {Array} drugs.data - Data about drug use.
 *
 * Generates the default value for a non-pathological medical history.
 * @returns {DefaultNonPathologicalHistory} The default non-pathological medical history with predefined empty or neutral values.
 */
export const genDefaultNonPathologicalHistory = () => ({
	bloodType: "-",
	smoker: {
		version: 1,
		data: [],
	},
	drink: {
		version: 1,
		data: [],
	},
	drugs: {
		version: 1,
		data: [],
	},
});
/**
 * Generates the default value for an allergic medical history in the DB.
 * @returns {import("./index.mjs").AllergicMedicalHistory}
 */
export const genDefaultAllergicHistory = () => ({
	medication: {
		version: 1,
		data: [],
	},
	food: {
		version: 1,
		data: [],
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
});

/**
 * @typedef {Object} DefaultGynecologicalHistory
 * Represents the default values for the gynecological history of a patient.
 *
 * @property {GynecologicalHistoryEntry} firstMenstrualPeriod - Default data for the first menstrual period.
 * @property {GynecologicalHistoryEntry} regularCycles - Default data for the regularity of menstrual cycles.
 * @property {GynecologicalHistoryEntry} painfulMenstruation - Default data for painful menstruation.
 * @property {PregnancyData} pregnancies - Default data for pregnancy history.
 * @property {GynecologicalIllnessData} diagnosedIllnesses - Default data for diagnosed gynecological illnesses.
 * @property {GynecologicalSurgeryData} hasSurgeries - Default data for surgical history.
 *
 * Each property uses a defined subtype to structure the data uniformly.
 */

/**
 * @typedef {Object} GynecologicalHistoryEntry
 * Represents the general structure for entries in the gynecological history.
 *
 * @property {number} version - The version of the data format.
 * @property {Object} data - Detailed data for the specific entry, containing various properties depending on the type.
 */

/**
 * @typedef {Object} PregnancyData
 * Detailed structure for pregnancy-related data.
 *
 * @property {number} totalPregnancies - Total number of pregnancies.
 * @property {number} vaginalDeliveries - Number of vaginal deliveries.
 * @property {number} cesareanSections - Number of cesarean sections.
 * @property {number} abortions - Number of abortions.
 */

/**
 * @typedef {Object} GynecologicalIllnessData
 * Detailed structure for diagnosed illnesses in the gynecological history.
 *
 * @property {GynecologicalIllnessEntry} ovarianCysts - Information about ovarian cysts.
 * @property {GynecologicalIllnessEntry} uterineMyomatosis - Information about uterine myomatosis.
 * @property {GynecologicalIllnessEntry} endometriosis - Information about endometriosis.
 * @property {GynecologicalIllnessEntry} otherConditions - Information about other diagnosed conditions.
 */

/**
 * @typedef {Object} GynecologicalIllnessEntry
 * Represents medication details for a gynecological illness.
 *
 * @property {GynecologicalIllnessMedication} medication - Medication details for the illness.
 */

/**
 * @typedef {Object} GynecologicalIllnessMedication
 * Detailed medication information for a gynecological condition.
 *
 * @property {string} medication - Name of the medication.
 * @property {string} dosage - Dosage of the medication.
 * @property {string} frequency - Frequency of medication intake.
 */

/**
 * @typedef {Object} GynecologicalSurgeryData
 * Detailed structure for surgeries in the gynecological history.
 *
 * @property {GynecologicalSurgeryEntry[]} ovarianCystsSurgery - Data about surgeries for ovarian cysts.
 * @property {GynecologicalSurgeryEntry} hysterectomy - Data about hysterectomy surgeries.
 * @property {GynecologicalSurgeryEntry} sterilizationSurgery - Data about sterilization surgeries.
 * @property {GynecologicalSurgeryEntry[]} breastMassResection - An array of data about breast mass resection surgeries.
 */

/**
 * Generates the default value for gynecological medical history.
 * @returns {DefaultGynecologicalHistory} The default gynecological medical history with predefined empty or neutral values.
 */
export const genDefaultGynecologicalHistory = () => ({
	firstMenstrualPeriod: {
		version: 1,
		data: { age: null },
	},
	regularCycles: {
		version: 1,
		data: { isRegular: false },
	},
	painfulMenstruation: {
		version: 1,
		data: { isPainful: false, medication: "" },
	},
	pregnancies: {
		version: 1,
		data: {
			totalPregnancies: 0,
			vaginalDeliveries: 0,
			cesareanSections: 0,
			abortions: 0,
		},
	},
	diagnosedIllnesses: {
		version: 1,
		data: {
			ovarianCysts: {},
			uterineMyomatosis: {},
			endometriosis: {},
			otherConditions: [],
		},
	},
	hasSurgeries: {
		version: 1,
		data: {
			ovarianCystsSurgery: [],
			hysterectomy: {},
			sterilizationSurgery: {},
			breastMassResection: [],
		},
	},
});

/**
 * Generates the default value for a psychiatric medical history in the DB.
 * @returns {import("./index.mjs").PsychiatricMedicalHistory}
 */
export const genDefaultPsychiatricHistory = () => ({
	depression: {
		version: 1,
		data: { medication: "", dose: "", frecuency: "", ube: false },
	},
	anxiety: {
		version: 1,
		data: { medication: "", dose: "", frecuency: "", ube: false },
	},
	ocd: {
		version: 1,
		data: { medication: "", dose: "", frecuency: "", ube: false },
	},
	adhd: {
		version: 1,
		data: { medication: "", dose: "", frecuency: "", ube: false },
	},
	bipolar: {
		version: 1,
		data: { medication: "", dose: "", frecuency: "", ube: false },
	},
	other: {
		version: 1,
		data: { ill: "", medication: "", dose: "", frecuency: "", ube: false },
	},
});
