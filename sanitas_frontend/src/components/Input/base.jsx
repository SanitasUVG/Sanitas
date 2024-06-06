import React from "react";

/**
 * Renders a basic input element with configurable properties.
 *
 * @param {Object} props - The props object.
 * @param {'text' | 'number' | 'date' | 'email' | 'password'} props.type - The type of the input, specifying the allowed types of inputs.
 * @param {string} props.value - The current value of the input.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Handler for changes to the input's value.
 * @param {string} [props.placeholder] - A placeholder text shown in the input.
 * @returns {React.Element} The React Input element.
 */
export default function BaseInput({ type, value, onChange, placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        backgroundColor: "#FFFFFF",
        color: "#000000",
        border: "1px solid #5B6670",
        padding: "6px 10px",
        outline: "none",
        borderRadius: "5px",
      }}
    />
  );
}
