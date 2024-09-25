/**
 * Checks if the CUI is valid or not.
 * @param {string} cui - The CUI to check
 * @returns {true | {error: string}} True if the CUI is valid, string with error otherwise.
 */
export function cuiIsValid(cui) {
	if (!cui) {
		return { error: "CUI is empty" };
	}

	const cuiRegExp = /^[0-9]{4}\s?[0-9]{5}\s?[0-9]{4}$/;

	if (!cuiRegExp.test(cui)) {
		return { error: "CUI with invalid format" };
	}

	const sanitizedCui = cui.replace(/\s/, "");
	const depto = Number.parseInt(sanitizedCui.substring(9, 11), 10);
	const muni = Number.parseInt(sanitizedCui.substring(11, 13));
	const numero = cui.substring(0, 8);
	const verificador = Number.parseInt(sanitizedCui.substring(8, 9));

	// Se asume que la codificación de Municipios y
	// departamentos es la misma que esta publicada en
	// http://goo.gl/EsxN1a

	// Listado de municipios actualizado segun:
	// http://goo.gl/QLNglm

	// Este listado contiene la cantidad de municipios
	// existentes en cada departamento para poder
	// determinar el código máximo aceptado por cada
	// uno de los departamentos.
	const munisPorDepto = [
		/* 01 - Guatemala tiene:      */ 17 /* municipios. */,
		/* 02 - El Progreso tiene:    */ 8 /* municipios. */,
		/* 03 - Sacatepéquez tiene:   */ 16 /* municipios. */,
		/* 04 - Chimaltenango tiene:  */ 16 /* municipios. */,
		/* 05 - Escuintla tiene:      */ 13 /* municipios. */,
		/* 06 - Santa Rosa tiene:     */ 14 /* municipios. */,
		/* 07 - Sololá tiene:         */ 19 /* municipios. */,
		/* 08 - Totonicapán tiene:    */ 8 /* municipios. */,
		/* 09 - Quetzaltenango tiene: */ 24 /* municipios. */,
		/* 10 - Suchitepéquez tiene:  */ 21 /* municipios. */,
		/* 11 - Retalhuleu tiene:     */ 9 /* municipios. */,
		/* 12 - San Marcos tiene:     */ 30 /* municipios. */,
		/* 13 - Huehuetenango tiene:  */ 32 /* municipios. */,
		/* 14 - Quiché tiene:         */ 21 /* municipios. */,
		/* 15 - Baja Verapaz tiene:   */ 8 /* municipios. */,
		/* 16 - Alta Verapaz tiene:   */ 17 /* municipios. */,
		/* 17 - Petén tiene:          */ 14 /* municipios. */,
		/* 18 - Izabal tiene:         */ 5 /* municipios. */,
		/* 19 - Zacapa tiene:         */ 11 /* municipios. */,
		/* 20 - Chiquimula tiene:     */ 11 /* municipios. */,
		/* 21 - Jalapa tiene:         */ 7 /* municipios. */,
		/* 22 - Jutiapa tiene:        */ 17 /* municipios. */,
	];

	if (depto === 0 || muni === 0) {
		return { error: "CUI with invalid `departamento` or `municipio` code." };
	}

	if (depto > munisPorDepto.length) {
		return { error: "CUI with invalid `departmento` code." };
	}

	if (muni > munisPorDepto[depto - 1]) {
		return { error: "CUI with invalid `municipio` code." };
	}

	// Se verifica el correlativo con base
	// en el algoritmo del complemento 11.
	let total = 0;

	for (let i = 0; i < numero.length; i++) {
		total += numero[i] * (i + 2);
	}

	const modulo = total % 11;

	if (modulo !== verificador) {
		return { error: `CUI with invalid modulus: ${modulo}` };
	}
	return true;
}
