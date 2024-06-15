import userSearch from "@tabler/icons/outline/user-search.svg";
import deleteSearch from "@tabler/icons/outline/x.svg";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a SearchInput component that includes search and clear icons.
 * This component allows users to type search queries, clear them with one click,
 * and supports submission via the Enter key.
 *
 * @param {Object} props - Properties of the component.
 * @param {'text' | 'number' | 'date' | 'email' | 'password'} props.type - Specifies the type of input to render, controlling the allowed types of text inputs.
 * @param {string} props.value - Current value of the input field.
 * @param {Function} props.onChange - Function to be executed when the input value changes.
 * @param {string} props.placeholder - Placeholder text to display in the input field when it is empty.
 * @returns {JSX.Element} JSX element of the SearchInput component.
 */
export default function SearchInput({ type, value = "", onChange, placeholder, style = {} }) {
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
      maxWidth: "400px",
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
      filter: "invert(38%) sepia(11%) saturate(0%) hue-rotate(196deg) brightness(95%) contrast(85%)",
      height: "16px",
      ...style.img,
    },
  };

  return (
    <div style={defaultStyles.container}>
      <span style={defaultStyles.img}>
        <img src={userSearch} />
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
      {isNotEmpty && (
        <span
          onClick={clearInput}
          tabIndex="0"
          onKeyDown={handleIconKeyDown}
          style={defaultStyles.img}
        >
          <img src={deleteSearch} />
        </span>
      )}
    </div>
  );
}
