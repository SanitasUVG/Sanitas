import React from "react";

/**
 * @typedef {Object} RadioInputProps
 * @property {string} name - The name attribute for the radio input; used to group radio buttons.
 * @property {boolean} checked - Whether the radio input is currently selected.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the radio input's state.
 * @property {string} label - The label text displayed next to the radio button.
 * @property {React.CSSProperties} [style={}] - Custom styles: `style.label` for the label (positioning and cursor), `style.input` for the input field (visibility and cursor), `style.outerSpan` for the outer span (layout and borders), and `style.innerSpan` for the inner span (visibility and background color).
 */

/**
 * Renders a radio button input with a label and customizable styles.
 * This component provides a stylized, interactive radio button that integrates seamlessly with various design schemes.
 * Custom styles can be applied to the label, input, and both outer and inner spans to match the desired aesthetic.
 *
 * @param {RadioInputProps} props - The properties passed to the RadioInput component.
 * @returns {JSX.Element} A labeled radio button element with customizable styles.
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
