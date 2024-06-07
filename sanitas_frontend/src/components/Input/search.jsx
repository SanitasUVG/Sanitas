import userSearch from "@tabler/icons/outline/user-search.svg";
import deleteSearch from "@tabler/icons/outline/x.svg";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a search input field with integrated search and clear icons. This component
 * allows users to type search queries, clear them with one click, and supports submission
 * via the Enter key.
 *
 * @param {Object} props - The props object.
 * @param {'text' | 'number' | 'date' | 'email' | 'password'} props.type - Specifies the type of input
 *    to render, controlling the allowed types of text inputs.
 * @param {string} props.placeholder - Placeholder text to display in the input field when it is empty.
 * @returns {React.Element} The rendered search input component with magnifying glass and clear icons.
 */
export default function SearchInput({ type, value = "", onChange, placeholder }) {
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

  return (
    <div className="search-input-container">
      <span>
        <img src={userSearch} />
      </span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name="searchInput"
      />
      {isNotEmpty && (
        <span onClick={clearInput} tabIndex="0" onKeyDown={handleIconKeyDown}>
          <img src={deleteSearch} />
        </span>
      )}
    </div>
  );
}
