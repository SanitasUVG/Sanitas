import { useState } from "react";

/**
 * @typedef {Object} IconButtonProps
 * @property {string} icon - The source URL of the icon to be displayed inside the button.
 * @property {Function} onClick - The callback function to be executed when the button is clicked.
 * @property {React.CSSProperties} [style] - Optional custom styles to be applied to the button.
 */

/**
 * Renders an icon button with a hover effect that slightly scales up the icon.
 * This component allows custom styles to be passed to customize its appearance.
 *
 * @param {IconButtonProps} props - The properties passed to the icon button component.
 * @returns {JSX.Element} A button element containing an image styled as an icon with interactive hover effects.
 */
const IconButton = ({ icon, onClick, style }) => {
	const [isHovered, setIsHovered] = useState(false);
	const [canClick, setCanClick] = useState(false);

	const baseStyle = {
		backgroundColor: "#FFFFFF",
		border: "none",
		cursor: "pointer",
		outline: "none",
		padding: "10px",
		transition: "transform 0.3s ease-in-out",
		transform: isHovered ? "scale(1.1)" : "scale(1)",
		...style,
	};

	const iconStyle = {
		width: "2.5rem",
		height: "2.5rem",
		transition: "filter 0.3s ease-in-out",
		filter: isHovered
			? "brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(1500%) hue-rotate(130deg) brightness(90%) drop-shadow(0 0 0.5rem rgb(181, 177, 177))"
			: "brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(1500%) hue-rotate(130deg) brightness(90%)",
	};

	const onClickHandler = async (...args) => {
		if (canClick) {
			setCanClick(false);
			const isAsync = onClick.constructor.name === "AsyncFunction";
			if (isAsync) {
				await onClick.apply(null, args);
			} else {
				onClick.apply(null, args);
			}
			setCanClick(true);
		}
	};

	return (
		<button
			type="button"
			style={baseStyle}
			onClick={onClickHandler}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<img src={icon} style={iconStyle} alt="Icon" />
		</button>
	);
};

export default IconButton;
