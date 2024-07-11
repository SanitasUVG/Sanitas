/**
 * @template T
 * @typedef {Object} SuspenseResource
 * @property {() => T} read
 */

import { delay } from ".";

function a() {
	return new Promise((res, rej) => {
		// blablabla programando blablab
		try {
			res(data);
		} catch (error) {
			rej(error);
		}
	});
}

async function b() {
	// blablabla programando blablab
	return data;
}

/**
 * Function used to wrap a promise for use with suspense.
 * If you want to use the `SuspenseResource` returned by this function please do so according to:
 * https://blog.logrocket.com/data-fetching-react-suspense/
 * @template T
 * @param {Promise<T>} promise - The promise to wrap in order to use suspense
 * @returns {SuspenseResource<T>} - The promise wrapped in an API thats compatible with suspense.
 */
export default function WrapPromise(promise) {
	let status = "pending";
	let response;

	const suspender = promise.then(
		(res) => {
			status = "success";
			response = res;
		},
		(error) => {
			status = "error";
			response = error;
		},
	);

	const read = () => {
		if (status === "pending") {
			throw suspender;
		}
		if (status === "error") {
			throw response;
		}
		return response;
	};

	return { read };
}

/**
 * @template T
 * @returns {SuspenseResource<T>}
 */
export function WrapPromiseErrorMock() {
	return {
		read: () => {
			throw "MOCK ERROR";
		},
	};
}

/**
 * @param {number} msTimeout - The number of ms to simulate before failing.
 */
export function WrapPromisePrendingMock(msTimeout) {
	let status = "pending";
	const promise = delay(msTimeout).then((res) => {
		status = "error";
		res();
	});

	const read = () => {
		if (status === "pending") {
			throw promise;
		}
		throw "MOCK ERROR";
	};

	return { read };
}
