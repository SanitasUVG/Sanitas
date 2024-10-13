import pino from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";
const destination = pinoLambdaDestination();

export const logger = pino(
	{
		// typical pino options
		level: "debug",
	},
	destination,
);

export const withRequest = lambdaRequestTracker();
