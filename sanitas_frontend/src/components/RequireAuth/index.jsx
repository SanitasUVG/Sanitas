import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import Throbber from "../Throbber";

/**
 * @typedef {Object} RequireAuthProps
 * @property {import("src/cognito.mjs").CognitoGetSessionCallback} getSession
 * @property {string} path - The path to navigate when the session is invalid.
 * @property {*} children - The components to display when the session is valid.
 * @property {import("src/store.mjs").UseStoreHook} useStore - The useStore hook.
 */

/**
 * @param {RequireAuthProps} props
 */
export default function RequireAuth({ children, getSession, path, useStore }) {
	const [isRedirecting, setIsRedirecting] = useState(false);
	const navigate = useNavigate();
	const sessionResource = WrapPromise(getSession());
	const setDisplayName = useStore((s) => s.setDisplayName);

	const Child = () => {
		const response = sessionResource.read();
		/**@type {import("amazon-cognito-identity-js").CognitoUserSession}*/
		const session = response.result;

		const sessionIsValid = response.error ? false : session.isValid();

		if (!sessionIsValid) {
			setTimeout(() => {
				setIsRedirecting(true);
			}, 2000);

			setTimeout(() => {
				navigate(path, { replace: true });
			}, 4000);
		} else {
			setIsRedirecting(false);
			console.log("Session: ", session);

			setDisplayName(session.getIdToken.payload.email ?? "no-username-found");
		}

		return !sessionIsValid ? (
			<div
				style={{
					width: "100vw",
					height: "100vh",
					display: "grid",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						opacity: isRedirecting ? 1 : 0,
						gridColumn: "1/2",
						gridRow: "1/2",
					}}
				>
					<Throbber loadingMessage="Redirigiendo al inicio de sesión..." />
				</div>
				<h1
					style={{
						opacity: !isRedirecting ? 1 : 0,
						color: colors.primaryBackground,
						gridColumn: "1/2",
						gridRow: "1/2",
					}}
				>
					Acceso denegado. Por favor, inicie sesión.
				</h1>
			</div>
		) : (
			<>{children}</>
		);
	};

	const Loading = () => {
		return (
			<div style={{ width: "100%", height: "100vh" }}>
				<Throbber loadingMessage="Cargando..." />
			</div>
		);
	};

	return (
		<Suspense fallback={<Loading />}>
			<Child />
		</Suspense>
	);
}
