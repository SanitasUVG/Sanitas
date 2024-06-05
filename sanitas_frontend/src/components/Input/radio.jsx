import React from "react";

function RadioInput({ name, checked, onChange, label }) {
  return (
    <label>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export default RadioInput;
