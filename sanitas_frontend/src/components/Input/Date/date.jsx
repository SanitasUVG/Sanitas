import React from "react";

/**
 * @typedef {Object} DateInputProps
 * @property {string} value - The current value of the date input, expected to be in 'YYYY-MM-DD' format.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the date input's value.
 * @property {string} [placeholder] - Optional placeholder text shown in the date input when it is empty.
 * @property {React.CSSProperties} [style] - Optional custom styles to apply to the input element.
 */

/**
 * Renders a date input element with configurable properties including value, change handler, optional placeholder, and customizable styles.
 * This component provides a user-friendly way to input dates, ensuring proper formatting and integration with custom styles.
 *
 * @param {DateInputProps} props - The properties passed to the date input component.
 * @returns {JSX.Element} The React Date Input element styled according to specified or default styles.
 */
export default function DateInput({
	value,
	onChange,
	placeholder,
	style = {},
}) {
	const defaultStyle = {
		backgroundColor: "#FFFFFF",
		color: "#5B6670",
		border: "1px solid #5B6670",
		padding: "6px 10px",
		outline: "none",
		borderRadius: "5px",
		fontFamily: "Montserrat, sans-serif",
		...style,
	};

	return (
		<input
			type="date"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			style={defaultStyle}
		/>
	);
}
