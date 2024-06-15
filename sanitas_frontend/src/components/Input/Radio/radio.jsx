import React from "react";

/**
 * Renders a radio button input with a label.
 *
 * @param {Object} props - The props object.
 * @param {string} props.name - The name attribute for the radio input; used to group radio buttons.
 * @param {boolean} props.checked - Whether the radio input is currently selected.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Handler for changes to the radio input's state.
 * @param {string} props.label - The label text displayed next to the radio button.
 * @returns {React.Element} A labeled radio button element.
 */
export default function RadioInput({ name, checked, onChange, label, style = {} }) {
  const defaultStyles = {
    label: {
      position: "relative",
      paddingLeft: "25px",
      cursor: "pointer",
      display: "inline-block",
      ...style.label,
    },
    input: {
      position: "absolute",
      opacity: 0,
      cursor: "pointer",
      ...style.input,
    },
    outerSpan: {
      position: "absolute",
      top: "0",
      left: "0",
      height: "20px",
      width: "20px",
      backgroundColor: "#FFFFFF",
      borderRadius: "50%",
      border: "1px solid #5B6670",
      display: "inline-block",
      padding: "3px",
      ...style.outerSpan,
    },
    innerSpan: {
      display: checked ? "block" : "none",
      width: "100%",
      height: "100%",
      backgroundColor: "#0F6838",
      borderRadius: "50%",
      ...style.innerSpan,
    },
  };

  return (
    <label style={defaultStyles.label}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={defaultStyles.input}
      />
      <span style={defaultStyles.outerSpan}>
        <span style={defaultStyles.innerSpan}></span>
      </span>
      {label}
    </label>
  );
}
