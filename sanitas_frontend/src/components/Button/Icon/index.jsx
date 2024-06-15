import React, { useState } from "react";

/**
 * Renders an icon button with a hover effect that slightly scales up the icon.
 * The component allows custom styles to be passed to customize its appearance.
 *
 * @param {string} icon - The source URL of the icon to be displayed.
 * @param {Function} onClick - The function to be called when the button is clicked.
 * @param {React.CSSProperties} [style] - Optional custom styles to apply to the button.
 * @returns {JSX.Element} A button element containing an image styled as an icon.
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
