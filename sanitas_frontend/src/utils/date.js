export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
