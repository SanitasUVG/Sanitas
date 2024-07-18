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
