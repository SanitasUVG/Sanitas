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
