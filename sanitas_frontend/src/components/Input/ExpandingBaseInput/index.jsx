import React, { useState, useEffect, useRef } from "react";

const ExpandingTextarea = ({ onChange, placeholder, style = {}, ...props }) => {
	const [value, setValue] = useState("");
	const textareaRef = useRef(null);

	const handleInputChange = (event) => {
		setValue(event.target.value);
		if (onChange) {
			onChange(event);
		}
	};

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "inherit";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [value]);

	const defaultStyle = {
		backgroundColor: "#FFFFFF",
		color: "#000000",
		border: "1px solid #5B6670",
		padding: "6px 10px",
		outline: "none",
		borderRadius: "5px",
		overflowY: "auto",
		resize: "none",
		...style,
	};

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={handleInputChange}
			placeholder={placeholder}
			style={defaultStyle}
			{...props}
		/>
	);
};

export default ExpandingTextarea;
