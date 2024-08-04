import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { colors } from "src/theme.mjs";
import RequireAuth from ".";

export default {
	title: "Components/RequireAuth",
	component: RequireAuth,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/protected"]}>
				<Routes>
					<Route path="/protected" element={<Story />} />
					<Route path="/login" element={<MockLoginScreen />} />
				</Routes>
			</MemoryRouter>
		),
	],
};

const getSessionErrMock = async () => {
	return { error: "Error!" };
};

const MockLoginScreen = () => (
	<div
		style={{
			color: colors.primaryBackground,
			width: "100%",
			height: "100vh",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			textAlign: "center",
			fontSize: "3rem",
			fontWeight: "bold",
		}}
	>
		Login
	</div>
);

export const AccessDenied = () => {
	return (
		<RequireAuth getSession={getSessionErrMock} path="/login">
			<div style={{ color: colors.errorColor }}>Acceso Denegado</div>
		</RequireAuth>
	);
};

const getSessionSuccessMock = async () => {
	return {
		result: {
			isValid: () => true,
		},
	};
};

export const Authenticated = () => {
	return (
		<RequireAuth getSession={getSessionSuccessMock} path="/login">
			<div
				style={{
					color: colors.primaryBackground,
					width: "100%",
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					fontSize: "3rem",
					fontWeight: "bold",
				}}
			>
				Contenido protegido visible para usuarios autenticados.
			</div>
		</RequireAuth>
	);
};
