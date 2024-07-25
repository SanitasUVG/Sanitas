import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import React, { useState } from "react";

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
		borderRadius: "5px",
		padding: "10px 20px",
		border: "none",
		cursor: "pointer",
		fontSize: "14px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		transition: "background-color 0.3s",
		overflow: "hidden",
		minWidth: "100px",
		...style,
	};

	const textStyle = {
		opacity: isHovered ? 0 : 1,
		position: "relative",
		visibility: isHovered ? "hidden" : "visible",
		transition: "opacity 0.3s, visibility 0.3s",
	};

	const iconStyle = {
		filter: "invert(100%)",
		opacity: isHovered ? 1 : 0,
		transform: isHovered ? "scale(1)" : "scale(0)",
		transition: "opacity 0.3s, transform 0.3s",
		position: "absolute",
		fontSize: "24px",
		transformOrigin: "center",
		visibility: isHovered ? "visible" : "hidden",
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
			<img src={arrowRight} style={iconStyle} />
		</button>
	);
}
