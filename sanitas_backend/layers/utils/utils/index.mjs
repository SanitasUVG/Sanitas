/**
 * @typedef {Object} DBPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} es_mujer
 * @property {string} nombres
 * @property {string|null} correo
 * @property {string} apellidos
 *
 * @property {string|null} nombre_contacto1
 * @property {string|null} parentesco_contacto1
 * @property {string|null} telefono_contacto1
 *
 * @property {string|null} nombre_contacto2
 * @property {string|null} parentesco_contacto2
 * @property {string|null} telefono_contacto2
 *
 * @property {string|null} tipo_sangre
 * @property {string|null} direccion
 * @property {number | null} id_seguro
 * @property {string} fecha_nacimiento
 * @property {string|null} telefono
 */

/**
 * @typedef {Object} APIPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string} names
 * @property {string} lastNames
 *
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} contactName2
 * @property {string|null} contactKinship2
 * @property {string|null} contactPhone2
 *
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {number | undefined} insuranceId
 * @property {string} birthdate
 * @property {string|null} phone
 */

/**
 * @template T
 * @typedef {Object} APIMedicalHistory
 * @property {number} patientId - The patient Id associated to this medical history.
 * @property {T} medicalHistory - The medical history data, each can have it's own format.
 */

/**
 * @template T
 * @typedef {Object} APIMedicalHistoryItem
 * @property {number} version - The version of this JSON API when it was saved to the DB.
 * @property {T} data - The data this item contains.
 */

/**
 * Maps a DBPatient to an APIPatient.
 * @param {DBPatient} dbPatient The patient received from the DB.
 * @returns {APIPatient} The patient object the API must return.
 */
export function mapToAPIPatient(dbPatient) {
  const {
    id,
    cui,
    es_mujer: isWoman,
    correo: email,
    nombres: names,
    apellidos: lastNames,

    nombre_contacto1: contactName1,
    parentesco_contacto1: contactKinship1,
    telefono_contacto1: contactPhone1,

    nombre_contacto2: contactName2,
    parentesco_contacto2: contactKinship2,
    telefono_contacto2: contactPhone2,

    tipo_sangre: bloodType,
    direccion: address,
    id_seguro: insuranceId,
    fecha_nacimiento: birthdate,
    telefono: phone,
  } = dbPatient;

  return {
    id,
    cui,
    email,
    isWoman,
    names,
    lastNames,

    contactName1,
    contactKinship1,
    contactPhone1,

    contactName2,
    contactKinship2,
    contactPhone2,

    bloodType,
    address,
    insuranceId,
    birthdate,
    phone,
  };
}

/**
 * @callback AddCORSHeadersCallback
 * @param {string} [allowMethods="GET"] The methods allowed by this HTTP request. By default accepts only GET requests.
 * @param {string} [allowOrigin="*"] The origin allowed by this HTTP request. By default accepts all.
 * @param {string} [allowHeaders="Content-Type"] The allowed headers for the HTTP request. By default only Content-Type is allowed.
 * @returns {ResponseBuilder} The response builder.
 */

/**
 * @typedef {Object} ResponseBuilder
 * @property {(status: number)=>ResponseBuilder} setStatusCode - Sets the response status code.
 * @property {(bodyObj: object)=> ResponseBuilder} setBody - Sets the response body. You don't need to stringify the body, this function will take care of that for you.
 * @property {(header: string, value: string)=>ResponseBuilder} addHeader - Adds a header to the response.
 * @property {AddCORSHeadersCallback}  addCORSHeaders - Adds some headers wanted by CORS. The default method is GET, origin is * and headres is Content-Type only.
 * @property {()=> import('aws-lambda').APIGatewayProxyResult} build - Build the Response.
 */

/**
 * The starting method to create an HTTP response.
 *
 * Use the method provided by this API to build a response.
 * @returns {ResponseBuilder}
 */
export function createResponse() {
  /** @type ResponseBuilder */
  const builder = {
    status: 500,
    headers: {},
    body: "",

    setStatusCode: (status) => {
      builder.status = status;
      return builder;
    },

    setBody: (bodyObj) => {
      builder.body = JSON.stringify(bodyObj);
      return builder;
    },

    addHeader: (header, value) => {
      builder.headers[header] = value;
      return builder;
    },

    addCORSHeaders: (allowMethods = "GET", allowOrigin = "*", allowHeaders = "Content-Type") => {
      builder.addHeader("Access-Control-Allow-Headers", allowHeaders);
      builder.addHeader("Access-Control-Allow-Origin", allowOrigin);
      builder.addHeader("Access-Control-Allow-Methods", allowMethods);

      return builder;
    },

    build: () => ({
      statusCode: builder.status,
      headers: builder.headers,
      body: builder.body,
    }),
  };

  return builder;
}

/**
 * @typedef {Object} DBStudentInfo
 * @property {string} id_paciente
 * @property {string} carnet
 * @property {string} carrera
 */

/**
 * @typedef {Object} APIStudentInfo
 * @property {string} patientId
 * @property {string} carnet
 * @property {string} career
 */

/**
 * Maps a DB Student info into an API student info.
 * @param {DBStudentInfo} dbStudentInfo - The DB student information.
 * @returns {APIStudentInfo} The API formatted student information.
 */
export function mapToAPIStudentInfo(dbStudentInfo) {
  const { id_paciente: patientId, carnet, carrera: career } = dbStudentInfo;

  return {
    patientId,
    carnet,
    career,
  };
}

/**
 * @typedef {Object} DBCollaborator
 * @property {number} id
 * @property {string} codigo
 * @property {string} area
 * @property {number} id_paciente
 */

/**
 * @typedef {Object} APICollaborator
 * @property {number} id
 * @property {string} codigo
 * @property {string} area
 * @property {number} patientId
 */

/**
 * Maps a DBCollaborator to an APICollaborator.
 * @param {DBCollaborator} dbCollaborator The collaborator received from the DB.
 * @returns {APICollaborator} The collaborator object the API must return.
 */
export function mapToAPICollaboratorInfo(dbCollaborator) {
  const { id, codigo: code, area, id_paciente: patientId } = dbCollaborator;

  return {
    id,
    code,
    area,
    patientId,
  };
}

/**
 * @typedef {Object} MedicalConditionData
 * @property {number} version - The version of the data format.
 * @property {Array<string|Object>} data - An array containing the medical history data.
 *                                         This array may contain simple strings for some conditions
 *                                         and objects for others that require more detailed information.
 */

/**
 * @typedef {Object} DBData
 * @property {number} id_paciente - The unique identifier of the patient.
 * @property {null|MedicalConditionData} hipertension_arterial_data - Medical history data for hypertension.
 * @property {null|MedicalConditionData} diabetes_mellitus_data - Medical history data for diabetes mellitus.
 * @property {null|MedicalConditionData} hipotiroidismo_data - Medical history data for hypothyroidism.
 * @property {null|MedicalConditionData} asma_data - Medical history data for asthma.
 * @property {null|MedicalConditionData} convulsiones_data - Medical history data for convulsions.
 * @property {null|MedicalConditionData} infarto_agudo_miocardio_data - Medical history data for myocardial infarction.
 * @property {null|MedicalConditionData} cancer_data - Medical history data for cancer.
 * @property {null|MedicalConditionData} enfermedades_cardiacas_data - Medical history data for cardiac diseases.
 * @property {null|MedicalConditionData} enfermedades_renales_data - Medical history data for renal diseases.
 * @property {null|MedicalConditionData} otros_data - Medical history data for other conditions not listed separately.
 */

/**
 * @typedef {Object} FamiliarMedicalHistory
 * @property {null|MedicalConditionData} medicalHistory.hypertension - Medical history data for hypertension.
 * @property {null|MedicalConditionData} medicalHistory.diabetesMellitus - Medical history data for diabetes mellitus.
 * @property {null|MedicalConditionData} medicalHistory.hypothyroidism - Medical history data for hypothyroidism.
 * @property {null|MedicalConditionData} medicalHistory.asthma - Medical history data for asthma.
 * @property {null|MedicalConditionData} medicalHistory.convulsions - Medical history data for convulsions.
 * @property {null|MedicalConditionData} medicalHistory.myocardialInfarction - Medical history data for myocardial infarction.
 * @property {null|MedicalConditionData} medicalHistory.cancer - Medical history data for cancer.
 * @property {null|MedicalConditionData} medicalHistory.cardiacDiseases - Medical history data for cardiac diseases.
 * @property {null|MedicalConditionData} medicalHistory.renalDiseases - Medical history data for renal diseases.
 * @property {null|MedicalConditionData} medicalHistory.others - Medical history data for other conditions.
 */

/**
 * @typedef {Object} FamiliarMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {FamiliarMedicalHistory} medicalHistory - An object containing formatted medical history data.
 */

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {FamiliarMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIFamilyHistory(dbData) {
  const formatResponse = (data) => {
    if (!data) return { version: 1, data: [] };
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        return { version: 1, data: [] };
      }
    }
    return data;
  };

  const medicalHistory = {};

  const keys = Object.keys(dbData);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== "id_paciente") {
      medicalHistory[key.replace("_data", "")] = dbData[key] ? dbData[key] : {};
    }
  }

  return {
    patientId: dbData.id_paciente,
    medicalHistory: {
      hypertension: formatResponse(dbData.hipertension_arterial_data),
      diabetesMellitus: formatResponse(dbData.diabetes_mellitus_data),
      hypothyroidism: formatResponse(dbData.hipotiroidismo_data),
      asthma: formatResponse(dbData.asma_data),
      convulsions: formatResponse(dbData.convulsiones_data),
      myocardialInfarction: formatResponse(dbData.infarto_agudo_miocardio_data),
      cancer: formatResponse(dbData.cancer_data),
      cardiacDiseases: formatResponse(dbData.enfermedades_cardiacas_data),
      renalDiseases: formatResponse(dbData.enfermedades_renales_data),
      others: formatResponse(dbData.otros_data),
    },
  };
}

// NOTE: We should not use "object" normally but this types will have to be changed when doing the JSDoc refactoring...

/**
 * @typedef {Object} PersonalMedicalHistory
 * @property {null|Object} medicalHistory.hypertension - Medical history data for hypertension.
 * @property {null|Object} medicalHistory.diabetesMellitus - Medical history data for diabetes mellitus.
 * @property {null|Object} medicalHistory.hypothyroidism - Medical history data for hypothyroidism.
 * @property {null|Object} medicalHistory.asthma - Medical history data for asthma.
 * @property {null|Object} medicalHistory.convulsions - Medical history data for convulsions.
 * @property {null|Object} medicalHistory.myocardialInfarction - Medical history data for myocardial infarction.
 * @property {null|Object} medicalHistory.cancer - Medical history data for cancer.
 * @property {null|Object} medicalHistory.cardiacDiseases - Medical history data for cardiac diseases.
 * @property {null|Object} medicalHistory.renalDiseases - Medical history data for renal diseases.
 * @property {null|Object} medicalHistory.others - Medical history data for other conditions.
 */

/**
 * @typedef {Object} PersonalMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {PersonalMedicalHistory} medicalHistory - An object containing formatted medical history data.
 */

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {PersonalMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIPersonalHistory(dbData) {
  const formatResponse = (data) => {
    if (!data) return { version: 1, data: [] };
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        return { version: 1, data: [] };
      }
    }
    return data;
  };

  const medicalHistory = {};

  const keys = Object.keys(dbData);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== "id_paciente") {
      medicalHistory[key.replace("_data", "")] = dbData[key] ? dbData[key] : {};
    }
  }

  return {
    patientId: dbData.id_paciente,
    medicalHistory: {
      hypertension: formatResponse(dbData.hipertension_arterial_data),
      diabetesMellitus: formatResponse(dbData.diabetes_mellitus_data),
      hypothyroidism: formatResponse(dbData.hipotiroidismo_data),
      asthma: formatResponse(dbData.asma_data),
      convulsions: formatResponse(dbData.convulsiones_data),
      myocardialInfarction: formatResponse(dbData.infarto_agudo_miocardio_data),
      cancer: formatResponse(dbData.cancer_data),
      cardiacDiseases: formatResponse(dbData.enfermedades_cardiacas_data),
      renalDiseases: formatResponse(dbData.enfermedades_renales_data),
      others: formatResponse(dbData.otros_data),
    },
  };
}

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {FamiliarMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */

/**
 * @typedef {Object} DBTraumatologicData
 * @property {number} id_paciente - The unique identifier of the patient.
 * @property {null|string|TraumatologicData} antecedente_traumatologico_data - The JSON or object containing detailed trauma data.
 */

/**
 * @typedef {Object} TraumatologicData
 * @property {number} version - The version of the data format.
 * @property {Array.<TraumaDetail>} data - Detailed information about each trauma.
 */

/**
 * @typedef {Object} TraumaDetail
 * @property {string} whichBone - The bone that was affected.
 * @property {string} year - The year when the trauma occurred.
 * @property {string} treatment - The treatment administered.
 */

/**
 * @typedef {Object} TraumatologicMedicalHistory
 * @property {TraumatologicData} traumas - Detailed records of the patient's traumatologic incidents.
 */

/**
 * @typedef {Object} TraumatologicHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {TraumatologicMedicalHistory} medicalHistory - Contains the detailed traumatologic history of the patient.
 */

/**
 * @param {DBTraumatologicData} dbData - The database record for traumatologic history.
 * @returns {TraumatologicHistory} Formatted response object with API-friendly field names.
 */
export function mapToAPITraumatologicHistory(dbData) {
  let { id_paciente: patientId, antecedente_traumatologico_data: traumatologicData } = dbData;

  return {
    patientId: patientId,
    medicalHistory: {
      traumas: traumatologicData,
    },
  };
}

/**
 * @typedef {Object} DBSurgicalHistory
 * @property {number} id_paciente
 * @property {import("./defaultValues.mjs").SurgicalHistory} antecedente_quirurgico_data - The JSON object stored in the DB.
 */

/**
 * Maps database surgical history data to the API format.
 * @param {DBSurgicalHistory} dbData - The surgical history data from the database.
 * @returns {import('./defaultValues.mjs').APISurgicalHistory} The surgical history formatted for the API.
 */
export function mapToAPISurgicalHistory(dbData) {
  let { id_paciente: patientId, antecedente_quirurgico_data: medicalHistory } = dbData;

  return {
    patientId,
    medicalHistory,
  };
}

/**
 * @typedef {Object} DBData
 * @property {number} id_paciente - The unique identifier of the patient.
 * @property {null|MedicalConditionData} medicamento_data - Allergic medical history data for medication.
 * @property {null|MedicalConditionData} comida_data - Allergic medical history data for food.
 * @property {null|MedicalConditionData} polvo_data - Allergic medical history data for dust.
 * @property {null|MedicalConditionData} polen_data - Allergic medical history data for pollen.
 * @property {null|MedicalConditionData} cambio_de_clima_data - Allergic medical history data for climate change.
 * @property {null|MedicalConditionData} animales_data - Allergic medical history data for animals.
 * @property {null|MedicalConditionData} otros_data - Allergic medical history data for other allergies.
 */

/**
 * @typedef {Object} AllergicMedicalHistory
 * @property {null|MedicalConditionData} medicamento - Allergic medical history data for medication.
 * @property {null|MedicalConditionData} comida - Allergic medical history data for food.
 * @property {null|MedicalConditionData} polvo - Allergic medical history data for dust.
 * @property {null|MedicalConditionData} polen - Allergic medical history data for pollen.
 * @property {null|MedicalConditionData} cambioDeClima - Allergic medical history data for climate change.
 * @property {null|MedicalConditionData} animales - Allergic medical history data for animals.
 * @property {null|MedicalConditionData} otros - Allergic medical history data for other allergies.
 */

/**
 * @typedef {Object} AllergicMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {AllergicMedicalHistory} allergicHistory - An object containing formatted allergic medical history data.
 */

/**
 * Converts the database records for a patient's allergic medical history from the raw format to a structured API response format.
 * This function checks if each allergic condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various allergic conditions of a patient.
 * @returns {AllergicMedicalHistoryAPI}  A structured object containing the patientId and a detailed allergicMedicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIAllergicMedicalHistory(dbData) {
  const formatResponse = (data) => {
    if (!data) return { version: 1, data: [] };
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        return { version: 1, data: [] };
      }
    }
    return data;
  };

  const allergicHistory = {
    medicamento: formatResponse(dbData.medicamento_data),
    comida: formatResponse(dbData.comida_data),
    polvo: formatResponse(dbData.polvo_data),
    polen: formatResponse(dbData.polen_data),
    cambioDeClima: formatResponse(dbData.cambio_de_clima_data),
    animales: formatResponse(dbData.animales_data),
    otros: formatResponse(dbData.otros_data),
  };

  return {
    patientId: dbData.id_paciente,
    allergicHistory,
  };
}
