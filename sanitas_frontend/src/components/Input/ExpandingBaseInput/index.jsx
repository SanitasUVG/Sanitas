import { useEffect, useRef } from "react";

/**
 * @typedef {Object} ExpandingBaseInputProps
 * @property {string} id - The unique identifier for the textarea element.
 * @property {(event: React.ChangeEvent<HTMLTextAreaElement>) => void} onChange - Handler for changes to the textarea's value.
 * @property {string} [placeholder] - Optional placeholder text shown in the textarea when it is empty.
 * @property {React.CSSProperties} [style] - Optional custom styles to apply to the textarea element.
 * @property {string} value - The current value of the textarea.
 * @property {any} [props] - Additional props to pass to the textarea element.
 *
 * This component renders an auto-expanding textarea element that adjusts its height based on the content.
 * The textarea's initial styles and behavior can be customized through the `style` prop. It supports all standard
 * textarea properties such as `readOnly` and `disabled` via spread attributes. The height adjustment is done automatically
 * to accommodate all content without needing a scrollbar, making it ideal for applications requiring dynamic text input areas.
 *
 * @param {ExpandingBaseInputProps} props - The properties passed to the textarea component.
 * @returns {JSX.Element} The React Textarea element styled and functioning as an auto-expanding input field.
 */
const ExpandingBaseInput = ({
	id,
	onChange,
	placeholder,
	style = {},
	value = "",
	...props
}) => {
	const textareaRef = useRef(null);

	useEffect(() => {
		const adjustHeight = () => {
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
				textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
			}
		};

		adjustHeight();

		if (value && textareaRef.current) {
			adjustHeight();
		}
	}, [value]);

	const handleChange = (event) => {
		if (onChange) {
			onChange(event);
		}
	};

	const defaultStyle = {
		backgroundColor: "#FFFFFF",
		color: "#000000",
		border: "1px solid #5B6670",
		padding: "6px 10px",
		outline: "none",
		borderRadius: "5px",
		overflowY: "hidden",
		resize: "none",
		width: "100%",
		...style,
	};

	return (
		<textarea
			id={id}
			ref={textareaRef}
			value={value}
			onChange={handleChange}
			placeholder={placeholder}
			style={defaultStyle}
			{...props}
		/>
	);
};

export default ExpandingBaseInput;
