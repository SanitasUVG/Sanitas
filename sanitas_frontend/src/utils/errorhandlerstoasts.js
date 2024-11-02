/**
 * Genera un mensaje de error apropiado basado en el código de error y el contexto
 * @param {Object} response - Respuesta de error de la API
 * @param {string} context - Contexto del error (ej: "cita", "historial", "vinculacion")
 * @returns {string} Mensaje de error formateado
 */
export const getErrorMessage = (response, context = "") => {
	let errorMessage = "¡Lo sentimos ha ocurrido un error!";
	const errorCode = response?.error?.error || response?.error;

	const errorMessages = {
		400: "Datos incorrectos o incompletos",
		401: "No tienes autorización para realizar esta acción",
		403: "No tienes permisos suficientes",
		404: "No se encontró el recurso solicitado",
		409: "Conflicto al procesar la solicitud",
		422: "Formato de datos inválido",
		500: "Error interno del servidor. Por favor, intenta más tarde",
	};

	const contextMessages = {
		cita: {
			400: "Datos de la cita incorrectos o incompletos",
			404: "No se encontró la cita solicitada",
			409: "La cita ha sido modificada por otro usuario",
		},
		historial: {
			400: "Datos del historial incorrectos o incompletos",
			404: "No se encontró el historial solicitado",
			409: "El historial ha sido modificado por otro usuario",
		},
		vinculacion: {
			400: "Datos incorrectos o incompletos. Por favor verifica el CUI ingresado",
			404: "No se encontró un paciente con el CUI proporcionado",
			409: "La cuenta ya está asociada a otro paciente",
		},
		alergias: {
			400: "Datos del antecedente alérgico incorrectos o incompletos",
			404: "No se encontró el registro de alergias",
			409: "El registro ha sido modificado por otro usuario",
		},
		psiquiatricos: {
			400: "Datos del antecedente psiquiátrico incorrectos o incompletos",
			404: "No se encontró el registro psiquiátrico",
			409: "El registro psiquiátrico ha sido modificado por otro usuario",
		},
		ginecoobstetricos: {
			400: "Datos del antecedente gineco-obstétrico incorrectos o incompletos",
			404: "No se encontró el registro gineco-obstétrico",
			409: "El registro gineco-obstétrico ha sido modificado por otro usuario",
		},
		personales: {
			400: "Datos del antecedente personal incorrectos o incompletos",
			404: "No se encontró el registro de antecedentes personales",
			409: "El registro personal ha sido modificado por otro usuario",
		},
		familiares: {
			400: "Datos del antecedente familiar incorrectos o incompletos",
			404: "No se encontró el registro de antecedentes familiares",
			409: "El registro familiar ha sido modificado por otro usuario",
		},
		quirurgicos: {
			400: "Datos del antecedente quirúrgico incorrectos o incompletos",
			404: "No se encontró el registro quirúrgico",
			409: "El registro quirúrgico ha sido modificado por otro usuario",
		},
		traumatologicos: {
			400: "Datos del antecedente traumatológico incorrectos o incompletos",
			404: "No se encontró el registro traumatológico",
			409: "El registro traumatológico ha sido modificado por otro usuario",
		},
		noPatologicos: {
			400: "Datos del antecedente no patológico incorrectos o incompletos",
			404: "No se encontró el registro de antecedentes no patológicos",
			409: "El registro no patológico ha sido modificado por otro usuario",
		},
		paciente: {
			400: "Datos del paciente incorrectos o incompletos",
			401: "No tienes autorización para actualizar este paciente",
			403: "No tienes permisos suficientes para modificar pacientes",
			404: "No se encontró el registro del paciente",
			409: "El registro del paciente ha sido modificado por otro usuario",
			422: "Formato de datos inválido en el registro del paciente",
			500: "Error interno del servidor al actualizar el paciente",
		},
	};

	if (errorCode) {
		for (const code of Object.keys(errorMessages)) {
			if (errorCode.includes(code)) {
				errorMessage =
					context && contextMessages[context]?.[code]
						? contextMessages[context][code]
						: errorMessages[code];
				break; // Salimos del bucle una vez encontrado el código
			}
		}

		// Si no se encontró un mensaje específico, usar el mensaje de error original
		if (errorMessage === "¡Lo sentimos ha ocurrido un error!") {
			errorMessage = `${errorMessage}\n${errorCode}`;
		}
	}

	return errorMessage;
};
