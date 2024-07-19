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
 * @property {T} medicalHistory - The medical history data, each can have its own format.
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
 * @property {AddCORSHeadersCallback}  addCORSHeaders - Adds some headers wanted by CORS. The default method is GET, origin is * and headers are Content-Type only.
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
 * @property {null|MedicalConditionData} infarto_agudo_miocardio_data - Medical history data for acute myocardial infarction.
 */

/**
 * Maps the medical history database data to the API format.
 * @param {DBData} dbData - The medical history data from the database.
 * @returns {import('./defaultValues.mjs').APIMedicalHistory<MedicalConditionData>} The medical history data formatted for the API.
 */
export function mapToAPIMedicalHistory(dbData) {
  const {
    id_paciente: patientId,
    hipertension_arterial_data,
    diabetes_mellitus_data,
    hipotiroidismo_data,
    asma_data,
    convulsiones_data,
    infarto_agudo_miocardio_data,
  } = dbData;

  return {
    patientId,
    medicalHistory: {
      hipertension_arterial: hipertension_arterial_data,
      diabetes_mellitus: diabetes_mellitus_data,
      hipotiroidismo: hipotiroidismo_data,
      asma: asma_data,
      convulsiones: convulsiones_data,
      infarto_agudo_miocardio: infarto_agudo_miocardio_data,
    },
  };
}
