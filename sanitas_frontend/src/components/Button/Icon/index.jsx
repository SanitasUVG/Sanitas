import React, { useState } from "react";

/**
 * IconButton component that displays an icon button with hover effect.
 * The icon scale increases when hovered.
 * The component allows passing additional styles to customize its appearance.
 *
 * @param {Object} props - The props for the IconButton component.
 * @param {string} props.icon - The source URL of the icon to be displayed.
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @param {Object} [props.style] - Optional custom styles to apply to the button.
 */
const IconButton = ({ icon, onClick, style }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    backgroundColor: "#FFFFFF",
    border: "none",
    cursor: "pointer",
    outline: "none",
    padding: "10px",
    transition: "transform 0.3s ease-in-out",
    transform: isHovered ? "scale(1.1)" : "scale(1)",
    ...style,
  };

  const iconStyle = {
    filter: "brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(1500%) hue-rotate(130deg) brightness(90%)",
  };

  return (
    <button
      type="button"
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={icon} style={iconStyle} alt="Icon" />
    </button>
  );
};

export default IconButton;
