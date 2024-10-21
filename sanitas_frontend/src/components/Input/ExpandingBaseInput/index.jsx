import { useEffect, useRef } from "react";

const ExpandingTextarea = ({
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

export default ExpandingTextarea;
