import { useState } from "react";
import { colors, fonts, fontSize } from "src/theme.mjs";
import upCaret from "@tabler/icons/filled/caret-up.svg";
import downCaret from "@tabler/icons/filled/caret-down.svg";

/**
 * @typedef {Object} CollapsableProps
 * @property {string} [title=""]
 * @property {boolean} [isCollapsed=true] Controls whether this component is collapsed or not, by default starts collapsed.
 * @property {*} children - The components to render inside.
 */

/**
 * @param {CollapsableProps} props
 */
export default function Collapsable(
	{ children, title, isCollapsed: startsCollapsed } = {
		childre: null,
		title: "",
		isCollapsed: true,
	},
) {
	const [isCollapsed, setIsCollapsed] = useState(startsCollapsed);

	return (
		<div>
			<button
				type="button"
				style={{
					backgroundColor: colors.primaryBackground,
					color: "white",
					borderWidth: "0",
					borderRadius: "0.3rem",
					padding: "0.5rem 1.2rem",
					fontFamily: fonts.titleFont,
					fontSize: fontSize.subtitleSize,
					fontWeight: "lighter",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: "0.5rem",
					width: "100%",
				}}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<img
					src={isCollapsed ? upCaret : downCaret}
					alt="Caret simbol"
					style={{
						filter: "invert(100%)",
					}}
				/>

				<p style={{ textAlign: "center", flexGrow: 1, fontWeight: "bold" }}>{title}</p>
			</button>
			<div
				style={{
					transition: ".2s",
					transformOrigin: "top center",
					transform: isCollapsed ? "scaleY(0)" : "",
				}}
			>
				{children}
			</div>
		</div>
	);
}
