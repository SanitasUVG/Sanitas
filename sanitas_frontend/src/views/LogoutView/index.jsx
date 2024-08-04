import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import useWindowSize from "src/utils/useWindowSize";

export default function LogoutView() {
	const { width, height } = useWindowSize();

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
					padding: `${adjustHeight(height, "4rem")} 8vw 0 8vw`,
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
						paddingTop: adjustHeight(height, "3rem"),
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
							paddingTop: adjustHeight(height, "5rem"),
						}}
					>
						¡Adiós!
					</h1>
					<p
						style={{
							textAlign: "center",
							fontFamily: fonts.textFont,
							fontSize: "1.5rem",
							paddingBottom: adjustHeight(height, "5rem"),
						}}
					>
						Ya has cerrado sesión, por favor, cierra esta ventana.
					</p>
				</div>

				{/* Footer */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					<p
						style={{
							alignSelf: "center",
							fontFamily: fonts.titleFont,
							fontSize: fontSize.textSize,
							paddingBottom: adjustHeight(height, "1rem"),
							textAlign: "center",
						}}
					>
						Para volver a iniciar sesión, haz clic en el botón de abajo.
					</p>
					<BaseButton
						text="Ingresar"
						style={{
							alignSelf: "center",
							width: "75%",
							fontFamily: fonts.titleFont,
							fontSize: fontSize.textSize,
						}}
					/>
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
}
