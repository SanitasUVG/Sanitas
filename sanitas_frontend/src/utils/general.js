/**
 * Creates a promise that delays for a certain amount of ms.
 * @param {number} ms
 */
export const delay = (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

/**
 * Creates a function that logs an error object and prepends a specified message.
 * @param {string} message The message to append to the log
 * @returns {Function} With a signature equivalent to `console.error`
 */
export const logError = (message) => {
  return (obj) => {
    /* eslint-disable no-console*/
    console.error(message, obj);
    /* eslint-enable no-console*/
  };
};

/**
 * Function that returns true when the lambda provided throws.
 * @param {()=>void} lambda
 * @returns {boolean} True if the lambda throws, false otherwise.
 */
export const lambdaThrows = (lambda) => {
  try {
    lambda();
    return false;
  } catch {
    return true;
  }
};
