import { useState } from "react";

/**
 * @typedef {Object} TextIconButtonProps
 * @property {string|JSX.Element} icon - The icon (either a URL or a React component).
 * @property {string} text - The text to display inside the button.
 * @property {Function} onClick - The callback function to be executed when the button is clicked.
 * @property {React.CSSProperties} [style] - Optional custom styles to be applied to the button.
 */

/**
 * Renders a button with an icon and text with a hover effect.
 *
 * @param {TextIconButtonProps} props - The properties passed to the button component.
 * @returns {JSX.Element} A button element containing both an icon and text with interactive hover effects.
 */
const TextIconButton = ({ icon, text, onClick, style }) => {
	const [isHovered, setIsHovered] = useState(false);

	const baseStyle = {
		backgroundColor: isHovered ? "#E6E7E7" : "#FFFFFF",
		border: "none",
		cursor: "pointer",
		outline: "none",
		padding: "10px 20px",
		display: "flex",
		alignItems: "center",
		gap: "10px",
		transition: "background-color 0.3s ease",
		width: "100%",
		...style,
	};

	const renderIcon = () => {
		if (typeof icon === "string") {
			return (
				<img src={icon} alt="Icon" style={{ height: "18px", width: "18px" }} />
			);
		}
		return icon;
	};

	return (
		<button
			type="button"
			style={baseStyle}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{renderIcon()} {text}
		</button>
	);
};

export default TextIconButton;
