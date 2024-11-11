/**
 * @typedef {Object} DateInputProps
 * @property {'date'} type - Specifies that the input type should always be date.
 * @property {string} value - The current value of the date input, expected to be in 'YYYY-MM-DD' format.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the date input's value.
 * @property {boolean} [readOnly=false] - If true, the input will be non-editable and displayed in a read-only state.
 * @property {string} [placeholder] - Optional placeholder text shown in the date input when it is empty.
 * @property {React.CSSProperties} [style] - Optional custom styles to apply to the input element.
 * @property {React.MouseEventHandler<HTMLInputElement>} [onClick] - Optional onClick handler.
 */

/**
 * Renders a date input element with configurable properties including value, change handler, read-only state, optional placeholder, and customizable styles.
 * This component provides a user-friendly way to input dates, ensuring proper formatting and integration with custom styles.
 *
 * @param {DateInputProps} props - The properties passed to the date input component.
 * @returns {JSX.Element} The React Date Input element styled according to specified or default styles.
 */
export default function DateInput({
	type = "date",
	value,
	readOnly = false,
	onChange,
	placeholder,
	style = {},
	onClick = () => {},
	...props
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
			type={type}
			value={value}
			readOnly={readOnly}
			onChange={onChange}
			onClick={onClick}
			placeholder={placeholder}
			style={defaultStyle}
			{...props}
		/>
	);
}
