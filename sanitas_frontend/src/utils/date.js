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
  const formattedDate = formatDate(dateString);
  const startDate = new Date(formattedDate);
  const today = new Date();
  const differenceInYears = today.getFullYear() - startDate.getFullYear();
  const monthDifference = today.getMonth() - startDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
    return differenceInYears - 1;
  }
  return differenceInYears;
};
