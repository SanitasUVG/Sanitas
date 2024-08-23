import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT, mapToAPIPatient } from "utils/index.mjs";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The function isn't that complex, it's just really large.
export const updatePatientHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("PUT");

	if (event.httpMethod !== "PUT") {
		throw new Error(
			`updatePatientHandler solo acepta el método PUT, intentaste: ${event.httpMethod}`,
		);
	}

	logger.info({ headers: event.headers }, "Received headers...");
	const jwt = event.headers.Authorization;

	logger.info({ jwt }, "Parsing JWT...");
	const tokenInfo = decodeJWT(jwt);
	if (tokenInfo.error) {
		logger.error({ error: tokenInfo.error }, "JWT couldn't be parsed!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	/** @type {import("utils/index.mjs").APIPatient} */
	const patientData = JSON.parse(event.body);
	logger.info(process.env, "Las variables de entorno son:");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Conectando a la base de datos...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
			logger.error({ error: itsDoctor.error }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (!itsDoctor) {
			const msg = "Unauthorized, you're not a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is a doctor!`);

		logger.info(
			patientData,
			"Actualizando datos del paciente en la base de datos...",
		);

		if (!patientData.id) {
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "ID es requerido" })
				.build();
		}

		const query = `
      UPDATE paciente
      SET 
        nombres = COALESCE($2, nombres),
        apellidos = COALESCE($3, apellidos),
        nombre_contacto1 = COALESCE($4, nombre_contacto1),
        parentesco_contacto1 = COALESCE($5, parentesco_contacto1),
        telefono_contacto1 = COALESCE($6, telefono_contacto1),
        nombre_contacto2 = COALESCE($7, nombre_contacto2),
        parentesco_contacto2 = COALESCE($8, parentesco_contacto2),
        telefono_contacto2 = COALESCE($9, telefono_contacto2),
        tipo_sangre = COALESCE($10, tipo_sangre),
        direccion = COALESCE($11, direccion),
        id_seguro = COALESCE($12, id_seguro),
        fecha_nacimiento = COALESCE($13, fecha_nacimiento),
        telefono = COALESCE($14, telefono),
        cui = COALESCE($15, cui),
        correo = COALESCE($16, correo),
        es_mujer = COALESCE($17, es_mujer)
      WHERE id = $1
      RETURNING *
    `;

		const values = [
			patientData.id,
			patientData.names || null,
			patientData.lastNames || null,
			patientData.contactName1 || null,
			patientData.contactKinship1 || null,
			patientData.contactPhone1 || null,
			patientData.contactName2 || null,
			patientData.contactKinship2 || null,
			patientData.contactPhone2 || null,
			patientData.bloodType || null,
			patientData.address || null,
			patientData.insuranceId || null,
			patientData.birthdate ? new Date(patientData.birthdate) : null,
			patientData.phone || null,
			patientData.cui || null,
			patientData.email || null,
			patientData.isWoman !== null ? patientData.isWoman : null,
		];

		logger.info({ query, values }, "Consulta SQL y valores:");

		const result = await client.query(query, values);

		if (result.rowCount === 0) {
			return responseBuilder
				.setStatusCode(400)
				.setBody({
					error: "No se encontraron registros con el ID proporcionado.",
				})
				.build();
		}

		logger.info("Datos del paciente actualizados exitosamente.");
		const response = responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIPatient(result.rows[0]))
			.build();

		logger.info(response, "Respondiendo con:");
		return response;
	} catch (error) {
		logger.error(
			error,
			"¡Se produjo un error al actualizar los datos del paciente!",
		);

		return responseBuilder.setStatusCode(400).setBody({
			error: "Se produjo un error al actualizar los datos del paciente.",
		});
	} finally {
		await client?.end();
	}
};
