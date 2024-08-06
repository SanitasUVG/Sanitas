/**
 * @typedef {Object} RadioInputProps
 * @property {string} name - The name attribute for the radio input; used to group radio buttons.
 * @property {boolean} checked - Whether the radio input is currently selected.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for changes to the radio input's state.
 * @property {boolean} [disabled=false] - If true, the radio input will be non-interactive.
 * @property {string} label - The label text displayed next to the radio button.
 * @property { {label: React.CSSProperties, input: React.CSSProperties, outerSpan: React.CSSProperties, innerSpan: React.CSSProperties} } [style] - Custom styles for sub-components:
 *        - `style.label`: Styles for the label, affecting positioning and cursor.
 *        - `style.input`: Styles for the input field, controlling visibility and cursor.
 *        - `style.outerSpan`: Styles for the outer span, affecting layout and borders.
 *        - `style.innerSpan`: Styles for the inner span, controlling visibility and background color. */

export default function RadioInput({
  name,
  checked,
  onChange,
  label,
  disabled = false,
  style = {},
}) {
  const defaultStyles = {
    label: {
      position: "relative",
      paddingLeft: "25px",
      cursor: disabled ? "default" : "pointer",
      display: "inline-block",
      ...style.label,
    },
    input: {
      position: "absolute",
      opacity: 0,
      cursor: disabled ? "default" : "pointer",
      ...style.input,
    },
    outerSpan: {
      position: "absolute",
      top: "0",
      left: "0",
      height: "20px",
      width: "20px",
      backgroundColor: "#FFFFFF",
      borderRadius: "50%",
      border: "1px solid #5B6670",
      display: "inline-block",
      padding: "3px",
      ...style.outerSpan,
    },
    innerSpan: {
      display: checked ? "block" : "none",
      width: "100%",
      height: "100%",
      backgroundColor: "#0F6838",
      borderRadius: "50%",
      ...style.innerSpan,
    },
  };

  return (
    <label style={defaultStyles.label}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        style={defaultStyles.input}
      />
      <span style={defaultStyles.outerSpan}>
        <span style={defaultStyles.innerSpan}></span>
      </span>
      {label}
    </label>
  );
}
