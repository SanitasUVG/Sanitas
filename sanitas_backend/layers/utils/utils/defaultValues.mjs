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