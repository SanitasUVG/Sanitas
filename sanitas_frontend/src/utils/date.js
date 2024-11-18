/**
 * Formats a date string into a standardized YYYY-MM-DD format.
 * @param {string} dateString - The input date string that needs to be formatted. It should be in a format parseable by the Date constructor.
 * @returns {string} The formatted date in YYYY-MM-DD format.
 */
export const formatDate = (dateString) => {
	const date = new Date(dateString);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * Calculates the number of full years between a specified date and the current date.
 * @param {string} dateString - The date string in a format that can be parsed by the Date constructor (YYYY-MM-DD).
 * @returns {number} The number of full years between the given date and today's date.
 */
export const calculateYearsBetween = (dateString) => {
	const [year, month, day] = dateString.split("-").map(Number);

	const today = new Date();
	let age = today.getFullYear() - year;

	if (
		today.getMonth() + 1 < month ||
		(today.getMonth() + 1 === month && today.getDate() < day)
	) {
		age--;
	}
	return age;
};
