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
function DateInput({ value, onChange, placeholder }) {
  return <input type="date" value={value} onChange={onChange} placeholder={placeholder} />;
}

export default DateInput;
