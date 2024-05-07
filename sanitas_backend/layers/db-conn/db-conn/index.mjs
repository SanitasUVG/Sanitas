import { XataClient } from "./xata.mjs";

/**
 * This file servers the purpose of exposing a unified API for obtaining data within the application.
 * In this case, we're using XATA (https://xata.io/).
 * As long as you reimplement the functions below, you can use whatever backend for data you want.
 */

/**
 * Obtains a XataClient, this function is used only for internal testing.
 * IMPORTANT: It should never be used for other purposes!
 * @param {string} apiKey - The API key for the Xata connection. This value should come from an environment variable
 * @param {string} branch - The Xata branch to connect to. This values should come from an environment variable.
 */
export function getXataClient(apiKey, branch) {
  return new XataClient({ apiKey, branch });
}
