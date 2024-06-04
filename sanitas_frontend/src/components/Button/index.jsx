import React from "react";

export default function Button({ text, onClick }) {
  return (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  );
}
