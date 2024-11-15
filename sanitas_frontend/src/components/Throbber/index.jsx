import SanitasLogo from "src/assets/images/logoSanitas.png";
import { colors, fonts } from "src/theme.mjs";
import { adjustWidth } from "src/utils";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} ThrobberProps
 * @property {string} loadingMessage - The message to display with the loading view.
 */

/**
 * @param {ThrobberProps} props
 */
export default ({ loadingMessage }) => {
	const { width } = useWindowSize();

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				backgroundColor: colors.secondaryBackground,
			}}
		>
			<div
				style={{
					width: adjustWidth(width, "17rem"),
				}}
			>
				<img
					style={{
						width: adjustWidth(width, "17rem"),
						height: "auto",
					}}
					src={SanitasLogo}
					alt="Logo Sanitas"
				/>
			</div>

			<p
				style={{
					color: colors.primaryBackground,
					fontSize: adjustWidth(width, "2rem"),
					textAlign: "center",
					fontFamily: fonts.textFont,
				}}
			>
				{loadingMessage}
			</p>
		</div>
	);
};
