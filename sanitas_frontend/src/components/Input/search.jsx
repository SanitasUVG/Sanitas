import { useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";

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

  const handleIconKeyDown = (e) => {
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
      maxWidth: "400px",
      minWidth: "300px",
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
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon}>
        <FaMagnifyingGlass />
      </span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name="searchInput"
        style={styles.input}
      />
      {isNotEmpty && (
        <span onClick={clearInput} tabIndex="0" onKeyDown={handleIconKeyDown} style={styles.icon}>
          <TiDeleteOutline />
        </span>
      )}
    </div>
  );
}
