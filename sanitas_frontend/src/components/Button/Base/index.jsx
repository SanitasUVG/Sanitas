import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import { useState } from "react";

/**
 * @typedef {Object} BaseButtonProps
 * @property {string} text - The text to be displayed inside the button.
 * @property {Function} onClick - The callback function to be executed when the button is clicked.
 * @property {React.CSSProperties} [style={}] - Optional custom styles to be applied to the button.
 */

/**
 * Renders a button with customizable text and an onClick event handler. The button includes
 * a hover effect where the text fades out and an arrow icon fades in.
 * @param {BaseButtonProps} props
 * @returns {JSX.Element} The React Button element.
 */
export default function BaseButton({ text, onClick, style = {} }) {
	const [isHovered, setIsHovered] = useState(false);

	const defaultStyle = {
		backgroundColor: "#0F6838",
		color: "#FFFFFF",
		borderRadius: "0.313rem",
		padding: "0.625rem 1.25rem",
		border: "none",
		cursor: "pointer",
		fontSize: "0.875rem",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		transition: "background-color 0.3s",
		overflow: "hidden",
		minWidth: "6.25rem",
		position: "relative",
		...style,
	};

	const textStyle = {
		opacity: isHovered ? 0 : 1,
		visibility: isHovered ? "hidden" : "visible",
		transition: "opacity 0.3s, visibility 0.3s",
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		width: "100%",
	};

	const iconStyle = {
		filter: "invert(100%)",
		opacity: isHovered ? 1 : 0,
		transform: isHovered ? "scale(1)" : "scale(0)",
		transition: "opacity 0.3s, transform 0.3s",
		fontSize: "1.5rem",
		transformOrigin: "center",
		visibility: isHovered ? "visible" : "hidden",
		position: "absolute",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={defaultStyle}
		>
			<span style={textStyle}>{text}</span>
			<img src={arrowRight} style={iconStyle} alt="Right button arrow" />
		</button>
	);
}
