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

/**
 * Adjusts the REM values based on the width of the screen.
 * The function scales the input REM values by a scaleFactor determined by the screen width.
 *
 * @param {number} width - The current width of the screen in pixels.
 * @param {string} remValues - A string containing space-separated REM values to be adjusted.
 * @returns {string} A string of space-separated REM values adjusted based on the screen width.
 * @example
 * // returns "9.300rem 18.600rem"
 * adjustWidth(1400, "10rem 20rem");
 */
export const adjustWidth = (width, remValues) => {
  let scaleFactor;
  if (width >= 1538) {
    scaleFactor = 1.0;
  } else if (width >= 1440) {
    scaleFactor = 0.93;
  } else if (width >= 1280) {
    scaleFactor = 0.83;
  } else {
    scaleFactor = 1.0;
  }

  return remValues
    .split(" ")
    .map((rem) => {
      const value = Number.parseFloat(rem) * scaleFactor;
      return `${value.toFixed(3)}rem`;
    })
    .join(" ");
};

/**
 * Adjusts the REM values based on the height of the screen.
 * The function scales the input REM values by a scaleFactor determined by the screen height.
 *
 * @param {number} height - The current height of the screen in pixels.
 * @param {string} remValues - A string containing space-separated REM values to be adjusted.
 * @returns {string} A string of space-separated REM values adjusted based on the screen height.
 * @example
 * // returns "9.400rem 18.800rem"
 * adjustHeight(850, "10rem 20rem");
 */
export const adjustHeight = (height, remValues) => {
  let scaleFactor;
  if (height >= 950) {
    scaleFactor = 1.0;
  } else if (height >= 900) {
    scaleFactor = 0.94;
  } else if (height >= 800) {
    scaleFactor = 0.84;
  } else {
    scaleFactor = 1.0;
  }

  return remValues
    .split(" ")
    .map((rem) => {
      const value = Number.parseFloat(rem) * scaleFactor;
      return `${value.toFixed(3)}rem`;
    })
    .join(" ");
};
