import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool,
	CognitoUserSession,
} from "amazon-cognito-identity-js";
import { IS_PRODUCTION } from "./constants.mjs";

const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID ?? "this-id-doesn't exist!";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "invalid cliend id!";

/** @type {null|CognitoUserPool} */
const pool = !IS_PRODUCTION
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
 * @type {CognitoRegisterUserCallback}
 */
export function registerUser(email, password) {
	return new Promise((res, _rej) => {
		pool.signUp(email, password, [], null, (error, data) => {
			if (error) {
				res({ error });
			} else {
				res({ result: data });
			}
		});
	});
}

/**
 * Mock the register user cognito function for development...
 *
 * @type {CognitoLoginUserCallback}
 */
export async function mockRegisterUser(email, password) {
	return { result: {} };
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

/**
 * @type {CognitoLoginUserCallback}
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

/**
 * Mocks a user login in.
 *
 * @type {CognitoLoginUserCallback}
 */
export async function mockSingInUser(email, password) {
	return { result: {} };
}

/**
 * Gets the user session
 * @callback CognitoGetSessionCallback
 * @returns {Promise<import("./dataLayer.mjs").Result<import("amazon-cognito-identity-js").CognitoUserSession,*>>} An object with the user session.
 */
/**
 * @type {CognitoGetSessionCallback}
 */
export async function getSession() {
	return new Promise((res, _rej) => {
		const user = pool.getCurrentUser();
		if (user) {
			user.getSession((error, session) => {
				if (error) {
					res({ error });
				} else {
					res({ result: session });
				}
			});
		} else {
			res({ error: new Error("No user found") });
		}
	});
}

/**
 * @type {CognitoGetSessionCallback}
 */
export async function mockGetSession() {
	return { result: { isValid: () => true } };
}

/**
 * Logs out the user from it's session.
 *
 * @callback CognitoLogoutUserCallback
 */

/**
 * @type {CognitoLogoutUserCallback}
 */
export function logoutUser() {
	const user = pool.getCurrentUser();
	if (user) {
		user.signOut();
	}
}

/**
 * @type {CognitoLogoutUserCallback}
 */
export function mockLogoutUser() {}
