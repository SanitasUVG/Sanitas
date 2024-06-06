import { useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";

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
export default function SearchInput({ type, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const clearInput = () => {
    setInputValue("");
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearInput();
    }
  };

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #5B6670",
      padding: "5px",
      borderRadius: "4px",
      maxWidth: "500px",
      minWidth: "400px",
    },
    input: {
      flexGrow: 1,
      border: "none",
      outline: "none",
      color: "#1B1B1B",
    },
    icon: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
      color: "#5B6670",
    },
    placeholder: {
      color: "#5B6670",
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon}>
        <FaMagnifyingGlass />
      </span>
      <input
        ref={inputRef}
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      {inputValue && (
        <span onClick={clearInput} tabIndex="0" onKeyDown={handleKeyDown} style={styles.icon}>
          <TiDeleteOutline />
        </span>
      )}
    </div>
  );
}
