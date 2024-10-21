/**
 * @typedef {Object} BaseInputProps
 * @property {'text' | 'number' | 'date' | 'email' | 'password'} type - The type of the input specifying the allowed types of inputs.
 * @property {string} value - The current value of the input.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the input's value.
 * @property {boolean} [readOnly=false] - If true, the input will be non-editable and displayed in a read-only state.
 * @property {string} [placeholder] - Optional placeholder text shown in the input when it is empty.
 * @property {React.CSSProperties} [style] - Optional custom styles to apply to the input element.
 * @property {React.MouseEventHandler<HTMLInputElement>} [onClick] - Optional onClick handler.
 *
 * Renders a basic input element with configurable properties including type, value, change handler, optional placeholder, and customizable styles.
 * This component is versatile for various data entries such as text, numbers, dates, emails, and passwords. It can be configured to be read-only by setting the `readOnly` property.
 *
 * @param {BaseInputProps} props - The properties passed to the input component.
 * @returns {JSX.Element} The React Input element styled according to specified or default styles.
 */

export default function BaseInput({
	type,
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
		color: "#000000",
		border: "1px solid #5B6670",
		padding: "6px 10px",
		outline: "none",
		borderRadius: "5px",
		...style,
	};

	// Manejar cambios en el valor del input
	const handleChange = (event) => {
		if (type === "number") {
			const newValue = event.target.value;
			if (/^[0-9]*\.?[0-9]*$/.test(newValue) || newValue === "") {
				onChange(event); // Llama al manejador onChange original si la entrada es válida
			}
		} else {
			onChange(event); // Para otros tipos, permite cualquier entrada
		}
	};

	// Bloquear caracteres no numéricos para inputs de tipo 'number'
	const handleKeyPress = (event) => {
		if (
			type === "number" &&
			!/^[0-9.]+$/.test(event.key) &&
			event.key !== "Backspace"
		) {
			event.preventDefault();
		}
	};

	return (
		<input
			type={type}
			value={value}
			readOnly={readOnly}
			onChange={handleChange}
			onKeyDown={handleKeyPress}
			onClick={onClick}
			placeholder={placeholder}
			style={defaultStyle}
			{...props}
		/>
	);
}
