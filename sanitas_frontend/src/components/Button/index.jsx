import React from "react";

/**
 * Renders a button with customizable text and onClick event handler.
 *
 * @param {Object} props - The props object for the Button component.
 * @param {string} props.text - The text to be displayed inside the button.
 * @param {Function} props.onClick - The callback function to be executed when the button is clicked.
 * @returns {React.Element} The React Button element.
 */
export default function Button({ text, onClick }) {
  return (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  );
}
