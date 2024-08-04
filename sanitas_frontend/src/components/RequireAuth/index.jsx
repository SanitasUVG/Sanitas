import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import Throbber from "../Throbber";

export default function RequireAuth({ children, getSession, path }) {
	const [isRedirecting, setIsRedirecting] = useState(false);
	const navigate = useNavigate();
	const sessionResource = WrapPromise(getSession());

	const Child = () => {
		const response = sessionResource.read();
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
					<Throbber loadingMessage="Redirigiendo al inicio de sesión..."></Throbber>
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
			<div style={{ width: "100%", height: "100%" }}>
				<Throbber loadingMessage="Cargando..."></Throbber>
			</div>
		);
	};

	return (
		<Suspense fallback={<Loading />}>
			<Child />
		</Suspense>
	);
}
