/**
 * @typedef {Object} SurgicalDataItem
 * @property {string} surgeryType - The type of surgery.
 * @property {string} surgeryYear - The year of surgery.
 * @property {string} complications - The complications that arose when the surgery was performed.
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
 * @typedef {Object} FamiliarMedicalHistory
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} hypertension
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} diabetesMellitus
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} hypothyroidism
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} asthma
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} convulsions
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} myocardialInfarction
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} cancer
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} cardiacDiseases
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} renalDiseases
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} others
 */

/**
 * Generates the default value for a familiar medical history in the DB.
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
 * @typedef {Object} TraumatologicalHistory
 * @property {import("./index.mjs").APIMedicalHistoryItem<any[]>} traumas
 */

/**
 * Generates the default value for a traumatological history in the DB.
 * @returns {TraumatologicalHistory}
 */
export const genDefaultTraumatologicalHistory = () => ({
  traumas: {
    version: 1,
    data: [],
  },
});

