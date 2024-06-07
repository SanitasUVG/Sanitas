import React, { useState } from "react";

/**
 * Renders a button with customizable text, onClick event handler, and hover effect.
 *
 * @param {Object} props - The props object for the Button component.
 * @param {string} props.text - The text to be displayed inside the button.
 * @param {Function} props.onClick - The callback function to be executed when the button is clicked.
 * @returns {React.Element} The React Button element.
 */
export default function Button({ text, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const defaultStyle = {
    backgroundColor: "#0F6838",
    color: "#FFFFFF",
    borderRadius: "5px",
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  };

  const hoverStyle = {
    ...defaultStyle,
    backgroundColor: "#137B4A",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={isHovered ? hoverStyle : defaultStyle}
    >
      {text}
    </button>
  );
}
