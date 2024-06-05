import React from "react";

function DateInput({ value, onChange, placeholder }) {
  return <input type="date" value={value} onChange={onChange} placeholder={placeholder} />;
}

export default DateInput;
