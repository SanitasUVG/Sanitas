import pino from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";
const destination = pinoLambdaDestination();

export const logger = pino(
	{
		// typical pino options
	},
	destination,
);

export const withRequest = lambdaRequestTracker();
