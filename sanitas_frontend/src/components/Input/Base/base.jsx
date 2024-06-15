import React from "react";

/**
 * @typedef {Object} BaseInputProps
 * @property {'text' | 'number' | 'date' | 'email' | 'password'} type - The type of the input specifying the allowed types of inputs.
 * @property {string} value - The current value of the input.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the input's value.
 * @property {string} [placeholder] - Optional placeholder text shown in the input when it is empty.
 * @property {React.CSSProperties} [style] - Optional custom styles to apply to the input element.
 */

/**
 * Renders a basic input element with configurable properties including type, value, change handler, optional placeholder, and customizable styles.
 * This component is versatile for various data entries such as text, numbers, dates, emails, and passwords.
 *
 * @param {BaseInputProps} props - The properties passed to the input component.
 * @returns {JSX.Element} The React Input element styled according to specified or default styles.
 */

export default function BaseInput({ type, value, onChange, placeholder, style = {} }) {
  const defaultStyle = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "1px solid #5B6670",
    padding: "6px 10px",
    outline: "none",
    borderRadius: "5px",

    ...style,
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={defaultStyle}
    />
  );
}
