import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginView from ".";
import { createEmptyStore } from "src/store.mjs";

export default {
	component: LoginView,
	decorators: [
		(Story) => {
			return (
				<MemoryRouter>
					<Routes>
						<Route path="/" element={<Story />} />
					</Routes>
				</MemoryRouter>
			);
		},
	],
};

export const Default = {
	args: {
		useStore: createEmptyStore(),
	},
};
