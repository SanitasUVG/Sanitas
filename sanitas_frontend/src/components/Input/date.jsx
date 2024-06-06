import React from "react";

/**
 * Renders a date input element.
 *
 * @param {Object} props - The props object.
 * @param {string} props.value - The current value of the date input, expected to be in 'YYYY-MM-DD' format.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - Handler for changes to the date input's value.
 * @param {string} [props.placeholder] - A placeholder text shown in the date input.
 * @returns {React.Element} The React Date Input element.
 */
export default function DateInput({ value, onChange, placeholder }) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        backgroundColor: "#FFFFFF",
        color: "#5B6670",
        border: "1px solid #5B6670",
        padding: "6px 10px",
        outline: "none",
        borderRadius: "5px",
        fontFamily: "Montserrat, sans-serif",
      }}
    />
  );
}
