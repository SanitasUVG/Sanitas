export function randomPhone() {
	return randomIntBetween(10_000_000, 1_000_000_000);
}

/**
 * @param {number} minInclusive - The minimum integer (inclusive)
 * @param {number} maxExclusive - The maximum integer (exclusive)
 * @returns {number} - A random number between the range.
 */
export function randomIntBetween(minInclusive, maxExclusive) {
	return Math.floor(
		Math.random() * (maxExclusive - minInclusive) + minInclusive,
	);
}

/**
 * Selects a random item from a list of options.
 *
 * @template T
 * @param {T[]} options - The options to select from
 * @returns {T}
 */
export function randomFrom(options) {
	return options[randomIntBetween(0, options.length)];
}

export function generateUniqueCUI() {
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

	const depto = randomIntBetween(1, 22);
	const muni = munisPorDepto[depto - 1];

	let numbers;
	let verificador;
	do {
		numbers = `${randomIntBetween(10000000, 1000000000)}`.substring(0, 8);
		verificador =
			numbers
				.split("")
				.map((n) => Number.parseInt(n, 10))
				.reduce((p, c, i) => p + c * (i + 2), 0) % 11;
		// Ignore the case when verificador is 10 since:
		// https://github.com/minfingt/validators/issues/5
	} while (verificador === 10);

	const formatter = new Intl.NumberFormat("es-GT", {
		minimumIntegerDigits: 2,
		maximumFractionDigits: 0,
	}).format;
	return `${numbers}${verificador}${formatter(depto)}${formatter(muni)}`;
}
