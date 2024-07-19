import { CognitoUserPool } from "amazon-cognito-identity-js";

const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID ?? "";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";

/** @type {null|CognitoUserPool} */
const pool = process.env.NODE_ENV === "test" ? null : new CognitoUserPool({
  UserPoolId: COGNITO_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

/**
 * Registers a user inside the cognito API.
 * @callback CognitoRegisterUserCallback
 *
 * @param {string} email - The users email
 * @param {string} password - The users password
 * @returns {Promise<import("./dataLayer.mjs").Result<*,*>>} The Amazon cognito response if successful will be inside the .result field.
 */

/**
 * @type CognitoRegisterUserCallback
 */
export async function registerUser(email, password) {
  try {
    const result = await new Promise((res, rej) => {
      pool.signUp(email, password, [], null, (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });

    return { result };
  } catch (error) {
    return { error };
  }
}
