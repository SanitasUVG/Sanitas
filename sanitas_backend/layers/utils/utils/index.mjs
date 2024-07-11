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
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {number | undefined} insuranceId
 * @property {string} birthdate
 * @property {string|null} phone
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
 * @property {AddCORSHeadersCallback}  addCORSHeaders - Adds some headers wanted by CORS.
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

		addCORSHeaders: (
			allowMethods = "GET",
			allowOrigin = "*",
			allowHeaders = "Content-Type",
		) => {
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

*@typedef { Object } APICollaborator
*@property { number } id
*@property { string } codigo
*@property { string } area
*@property { number } patientId
  * /

/**

Maps a DBCollaborator to an APICollaborator.
@param {DBCollaborator} dbCollaborator The collaborator received from the DB.
@returns {APICollaborator} The collaborator object the API must return.
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
