import React from "react";

/**
 * Renders a dropdown menu with configurable options and selected value.
 *
 * @param {Object} props - The props object for the DropdownMenu component.
 * @param {string} props.value - The currently selected value of the dropdown.
 * @param {Function} props.onChange - The callback function to be executed when the selected option is changed.
 * @param {Array<{value: string, label: string}>} props.options - An array of objects representing the options available in the dropdown. Each option should have a `value` and a `label`.
 * @returns {React.Element} The React Select element with options.
 */
export default function DropdownMenu({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
