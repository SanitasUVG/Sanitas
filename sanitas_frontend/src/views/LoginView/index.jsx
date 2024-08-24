import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { BaseInput } from "src/components/Input";
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import WrapPromise from "src/utils/promiseWrapper";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} LoginViewProps
 * @property {import("src/cognito.mjs").CognitoLoginUserCallback} loginUser - The callback to login a user.
 * @property {import("src/cognito.mjs").CognitoLoginUserCallback} getRole - The callback to login a user.
 */

/**
 * @param {LoginViewProps} props
 */

export default function LoginView({ loginUser, getRole }) {
	const { width, height } = useWindowSize();

	/** @type React.CSSStyleDeclaration */
	const inputStyles = {
		width: "100%",
		paddingTop: adjustHeight(height, "0.8rem"),
		paddingBottom: adjustHeight(height, "0.8rem"),
		paddingRight: adjustWidth(width, "0.8rem"),
		paddingLeft: adjustWidth(width, "0.8rem"),

		fontSize: fontSize.textSize,
	};

	const Child = () => {
		const navigate = useNavigate();
		const [username, setUsername] = useState("");
		const [password, setPassword] = useState("");
		const [errorMessage, setErrorMessage] = useState("");
		/** @type {[import("src/utils/promiseWrapper").SuspenseResource<import("src/dataLayer.mjs").Result<any, any>>, Function]} */
		const [loginResource, setLoginResource] = useState(null);
		/** @type {[import("src/utils/promiseWrapper").SuspenseResource<import("src/dataLayer.mjs").Result<any, any>>, Function]} */
		const [roleResource, setGetRoleResource] = useState(null);

		const handleLogin = () => {
			setLoginResource(WrapPromise(loginUser(username, password)));
			setGetRoleResource(WrapPromise(getRole()));
		};

		if (loginResource !== null && roleResource !== null) {
			const loginResponse = loginResource.read();
			const roleResponse = roleResource.read();

			if (loginResponse.error || roleResponse.error) {
				setErrorMessage("Lo sentimos! Ha ocurrido un error interno.");
			} else {
				if (roleResponse.result === "DOCTOR") {
					navigate(NAV_PATHS.SEARCH_PATIENT, { replace: true });
				} else {
					navigate(NAV_PATHS.STUDENT_WELCOME, { replace: true });
				}
			}

			setLoginResource(null);
			setGetRoleResource(null);
		}

		return (
			<div
				style={{
					backgroundImage: `url(${backgroundImage})`,
					backgroundColor: "black",
					backgroundSize: "cover",
					width: "100vw",
					height: "100vh",
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					overflowY: "scroll",
				}}
			>
				{/* White container */}
				<div
					style={{
						background: "white",
						padding: `${adjustHeight(height, "4rem")}·8vw·0·8vw`,
						display: "flex",
						flexDirection: "column",
						gap: adjustHeight(height, "3rem"),
						width: "45%",
						height: "90%",
						position: "relative",
						borderRadius: "1rem",
					}}
				>
					{/* Header */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<img
							style={{
								alignSelf: "center",
								height: "15vh",
							}}
							alt="UVG Logo"
							src={uvgLogo}
						/>

						<h1
							style={{
								textAlign: "center",
								fontFamily: fonts.titleFont,
								color: colors.titleText,
								paddingBottom: adjustHeight(height, "1rem"),
								paddingTop: adjustHeight(height, "1rem"),
							}}
						>
							¡Bienvenid@!
						</h1>
						<p
							style={{
								textAlign: "center",
								fontFamily: fonts.textFont,
								fontSize: "1.5rem",
								paddingBottom: adjustHeight(height, "1rem"),
							}}
						>
							Ingresa tus datos
						</p>
					</div>

					{/* Inputs */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: adjustHeight(height, "1.5rem"),
						}}
					>
						<div>
							<label
								style={{
									display: "block",
									fontFamily: fonts.textFont,
									fontSize: fontSize.subtitleSize,
									paddingBottom: adjustHeight(height, "0.5rem"),
								}}
							>
								Correo electrónico:
							</label>
							<BaseInput
								placeholder="Ingrese su correo"
								style={inputStyles}
								value={username}
								onChange={(ev) => setUsername(ev.target.value)}
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									fontFamily: fonts.textFont,
									fontSize: fontSize.subtitleSize,
									paddingTop: adjustHeight(height, "0.5rem"),
									paddingBottom: adjustHeight(height, "0.5rem"),
								}}
							>
								Contraseña:
							</label>
							<BaseInput
								placeholder="Ingrese su contraseña"
								style={inputStyles}
								value={password}
								type="password"
								onChange={(ev) => setPassword(ev.target.value)}
							/>
							<p
								style={{
									textAlign: "right",
									fontFamily: fonts.titleFont,
									fontSize: "0.90rem",
									color: colors.titleText,
									fontWeight: "bold",
									paddingTop: adjustHeight(height, "0.5rem"),
								}}
							>
								¿Olvidaste tu contraseña?
							</p>
						</div>
					</div>

					{/* Footer */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<BaseButton
							text="Ingresar"
							style={{
								alignSelf: "center",
								width: "75%",
								fontFamily: fonts.titleFont,
								fontSize: fontSize.textSize,
							}}
							onClick={handleLogin}
						/>
						<p
							style={{
								alignSelf: "center",
								fontFamily: fonts.titleFont,
								fontSize: fontSize.textSize,
								paddingTop: adjustHeight(height, "1rem"),
							}}
						>
							¿No tienes cuenta?
							<span
								style={{
									cursor: "pointer",
									fontWeight: "bold",
									color: colors.titleText,
									textDecoration: "none",
									paddingLeft: "0.5rem",
								}}
								onClick={() =>
									navigate(NAV_PATHS.REGISTER_USER, { replace: true })
								}
								onKeyUp={() =>
									navigate(NAV_PATHS.REGISTER_USER, { replace: true })
								}
								onMouseEnter={(e) => {
									e.target.style.textDecoration = "underline";
								}}
								onMouseLeave={(e) => {
									e.target.style.textDecoration = "none";
								}}
							>
								Crea una aquí.
							</span>
						</p>

						<p
							style={{
								alignSelf: "center",
								color: colors.statusDenied,
								fontWeight: "bold",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							{errorMessage}
						</p>
					</div>

					<img
						src={logoSanitas}
						alt="Sanitas logo"
						style={{
							width: adjustWidth(width, "6rem"),
							position: "absolute",
							bottom: adjustHeight(height, "1rem"),
							right: adjustHeight(height, "1rem"),
						}}
					/>
				</div>
			</div>
		);
	};
	const LoadingView = () => {
		return (
			<div
				style={{
					height: "100vh",
				}}
			>
				<Throbber loadingMessage="Iniciando sesión..." />
			</div>
		);
	};

	return (
		<Suspense fallback={<LoadingView />}>
			<Child />
		</Suspense>
	);
}
