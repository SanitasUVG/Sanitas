import React, { useState } from "react";

/**
 * @typedef {Object} DropdownMenuProps
 * @property {string} value - The currently selected value of the dropdown.
 * @property {(event: React.ChangeEvent<HTMLSelectElement>) => void} onChange - The callback function to be executed when the selected option is changed. It receives a React event object which provides the new value of the select element.
 * @property {Array<{value: string, label: string}>} options - An array of objects representing the options available in the dropdown. Each option should have a `value` and a `label`.
 */

/**
 * Renders a dropdown menu with configurable options and selected value.
 *
 * @param {DropdownMenuProps} props - The props object for the DropdownMenu component.
 * @returns {React.Element} The React Select element with options.
 */
export default function DropdownMenu({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDropdownChange = (e) => {
    onChange(e);
    setIsOpen(false);
  };

  const handleDropdownBlur = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const styles = {
    container: {
      position: "relative",
      width: "190px",
    },
    select: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      color: "#0F6838",
      borderRadius: "5px",
      padding: "10px 30px 10px 10px",
      border: "2px solid #0F6838",
      cursor: "pointer",
      fontSize: "14px",
      appearance: "none",
      outline: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
    },
    option: {
      backgroundColor: "#FFFFFF",
      color: "#0F6838",
    },
    indicator: {
      position: "absolute",
      top: "50%",
      right: "5%",
      transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
      transition: "transform 0.3s",
      pointerEvents: "none",
      color: "#0F6838",
      fontSize: "12px",
    },
  };

  return (
    <div style={styles.container}>
      <select
        value={value}
        onChange={handleDropdownChange}
        onMouseDown={toggleDropdown}
        onBlur={handleDropdownBlur}
        style={styles.select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} style={styles.option}>
            {option.label}
          </option>
        ))}
      </select>
      <div style={styles.indicator}>▼</div>
    </div>
  );
}
