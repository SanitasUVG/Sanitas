import React from "react";

export default function Button({ text, onClick }) {
  return (
    <button onClick={onClick} type="button">
      {text}
    </button>
  );
}
