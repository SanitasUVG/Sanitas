import { useState } from "react";
import { colors, fonts, fontSize } from "src/theme.mjs";
import upCaret from "@tabler/icons/filled/caret-up.svg";
import downCaret from "@tabler/icons/filled/caret-down.svg";

/**
 * @typedef {Object} CollapsableProps
 * @property {string} title
 * @property {*} children - The components to render inside.
 */

/**
 * @param {CollapsableProps} props
 */
export default function Collapsable({ children, title }) {
	const [isCollapsed, setIsCollapsed] = useState();

	return (
		<div>
			<button
				type="button"
				style={{
					backgroundColor: colors.primaryBackground,
					color: "white",
					borderWidth: "0",
					borderRadius: "0.2rem",
					padding: "0.5rem 1.2rem",
					fontFamily: fonts.titleFont,
					fontSize: fontSize.subtitleSize,
					fontWeight: "lighter",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: "0.5rem",
				}}
				onClick={() => setIsCollapsed(!isCollapsed)}
			>
				<img
					src={isCollapsed ? downCaret : upCaret}
					alt="Caret simbol"
					style={{
						filter: "invert(100%)",
					}}
				/>

				<p style={{ textAlign: "center", flexGrow: 1 }}>{title}</p>
			</button>
			{isCollapsed ? <div>{children}</div> : null}
		</div>
	);
}
