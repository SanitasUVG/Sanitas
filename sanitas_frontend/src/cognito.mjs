import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool,
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
export async function mockRegisterUser(_email, _password) {
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
export async function mockSingInUser(_email, _password) {
	return { result: {} };
}

/**
 * Gets the user session
 * @callback CognitoGetSessionCallback
 * @param {boolean} [isDoctor=true] - Flag to indicate if the generated session is of a doctor or patient.
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
export async function mockGetSession(isDoctor = true) {
	const doctorJWT =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRvY3RvckBnbWFpbC5jb20ifQ.VnyYMhqM1w4R2sSiLPY2-jaYyCqDF47EpACto1Ga6EA";
	const patientJWT =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAZ21haWwuY29tIn0.FbVOS-5cuUnrdvoyyMmroGgorO5t9c1_SFR4RHqSkN8";
	const jwtToken = isDoctor ? doctorJWT : patientJWT;
	return { result: { isValid: () => true, idToken: { jwtToken } } };
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
