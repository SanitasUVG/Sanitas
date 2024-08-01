import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { func } from "prop-types";

// FIXME: CHANGE THE DEFAULT STRINGS FOR EMPTY STRINGS BEFORE PUBLISHING!
const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID ?? "us-east-2_qXDWDnKQf";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "6q1gvfb8ohm7k6qmkm8sik1n8r";

/** @type {null|CognitoUserPool} */
const pool = process.env.NODE_ENV === "test"
  ? null
  : new CognitoUserPool({
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

/**
 * Logs in a user inside the cognito API.
 * @callback CognitoLoginUserCallback
 *
 * Authenticates a user with Cognito.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<import("./dataLayer.mjs").Result<*,*>>} The session data if authentication is successful.
 */
export async function signInUser(email, password) {
  try {
    const user = new CognitoUser({
      Username: email,
      Pool: pool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const result = await new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (session) => resolve(session),
        onFailure: (err) => reject(err),
      });
    });
    return { result };
  } catch (error) {
    return { error };
  }
}

export async function getSession() {
  return await new Promise((resolve, reject) => {
    const user = pool.getCurrentUser();
    if (user) {
      user.getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    } else {
      reject(new Error("No user found"));
    }
  });
}

export function logoutUser() {
  const user = pool.getCurrentUser();
  if (user) {
    user.signOut();
  }
}
