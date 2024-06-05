import React from "react";

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
