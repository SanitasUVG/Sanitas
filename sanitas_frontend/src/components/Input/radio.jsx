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
function RadioInput({ name, checked, onChange, label }) {
  return (
    <label>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export default RadioInput;
