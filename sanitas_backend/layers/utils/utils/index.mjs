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
