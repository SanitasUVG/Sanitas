import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { delay } from "src/utils";
import RegisterView from ".";

export default {
	component: RegisterView,
	decorators: [
		(Story) => {
			return (
				<MemoryRouter>
					<Routes>
						<Route path="/" element={<Story />} />
						<Route
							path="/login"
							element={
								<Link to="/">Welcome to Login! Go back to register...</Link>
							}
						/>
					</Routes>
				</MemoryRouter>
			);
		},
	],
};

/** @type {{args: import(".").RegisterViewProps}} */
export const Normal = {
	args: {
		registerUser: async (_email, _password) => {
			await delay(1000);
			const result = "OK";
			return { result };
		},
	},
};

/** @type {{args: import(".").RegisterViewProps}} */
export const ErrorCase = {
	args: {
		registerUser: async (_email, _password) => {
			await delay(1000);
			const error = "Simulated server error";
			return { error };
		},
	},
};
