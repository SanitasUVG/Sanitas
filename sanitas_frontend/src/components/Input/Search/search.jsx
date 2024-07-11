import userSearch from "@tabler/icons/outline/user-search.svg";
import deleteSearch from "@tabler/icons/outline/x.svg";
import { useEffect, useRef, useState } from "react";

/**
 * @typedef {Object} SearchInputProps
 * @property {'text' | 'number' | 'date' | 'email' | 'password'} type - Specifies the type of input to render.
 * @property {string} value - Current value of the input field.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Function for input value changes.
 * @property {string} [placeholder] - Placeholder text for the input field.
 * @property { {container: React.CSSProperties, input: React.CSSProperties, img: React.CSSProperties} } [style] - Custom styles for sub-components:
 *        - `style.container`: Styles for the outer container, affecting layout and borders.
 *        - `style.input`: Styles for the input field, controlling text color and background.
 *        - `style.img`: Styles for the icons, including hover effects like scaling or color change. */

/**
 * Renders a SearchInput component with search and clear icons. Allows users to type search queries, clear them with one click,
 * and supports submission via the Enter key. Custom styles can be applied to the container, input field, and icons.
 *
 * @param {SearchInputProps} props - The properties passed to the SearchInput component.
 * @returns {JSX.Element} An interactive SearchInput component with customizable aesthetics.
 */
export default function SearchInput({
	type,
	value = "",
	onChange,
	placeholder,
	style = {},
}) {
	const [isNotEmpty, setIsNotEmpty] = useState(value.length > 0);
	const inputRef = useRef(null);

	useEffect(() => {
		setIsNotEmpty(value && value.length > 0);
	}, [value]);

	const clearInput = () => {
		const event = { target: { value: "", name: inputRef.current.name } };
		onChange(event);
		inputRef.current.focus();
	};

	/**
	 * Handles the Enter key press on the clear icon.
	 * @param {React.KeyboardEvent} e - Keyboard event.
	 */
	const handleIconKeyDown = (e) => {
		if (e.key === "Enter") {
			clearInput();
		}
	};

	const defaultStyles = {
		container: {
			display: "flex",
			alignItems: "center",
			border: "1px solid #5B6670",
			padding: "5px",
			borderRadius: "4px",
			maxWidth: "600px",
			minWidth: "300px",
			...style.container,
		},
		input: {
			flexGrow: 1,
			border: "none",
			outline: "none",
			color: "#1B1B1B",
			...style.input,
		},
		img: {
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			padding: "0 8px",
			filter:
				"invert(38%) sepia(11%) saturate(0%) hue-rotate(196deg) brightness(95%) contrast(85%)",
			height: "16px",
			...style.img,
		},
	};

	return (
		<div style={defaultStyles.container}>
			<span style={defaultStyles.img}>
				<img src={userSearch} alt="Search icon" />
			</span>
			<input
				ref={inputRef}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				name="searchInput"
				style={defaultStyles.input}
			/>
			<span
				onClick={clearInput}
				onKeyDown={handleIconKeyDown}
				style={defaultStyles.img}
			>
				<img
					src={deleteSearch}
					style={{ visibility: isNotEmpty ? "visible" : "hidden" }}
					alt="Delete search icon"
				/>
			</span>
		</div>
	);
}
