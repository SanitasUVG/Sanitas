import React, { useState } from "react";
import { colors, fonts } from "src/theme.mjs";

export default function AppointmentSurgeryCard({ type, year, surgeryType, date, reason, onClick }) {
  const [hover, setHover] = useState(false);

  const cardStyle = {
    backgroundColor: hover ? colors.sidebarHover : colors.secondaryBackground,
    borderBottom: hover ? "0.1rem solid transparent" : `0.01rem solid ${colors.darkerGrey}`,
    cursor: "pointer",
    padding: "1.5rem",
    transition: "background-color 0.3s, border-bottom 0.3s",
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
  };

  const labelStyle = {
    fontWeight: "bold",
    fontFamily: fonts.textFont,
  };

  const contentStyle = {
    fontFamily: fonts.textFont,
  };

  const truncateText = (text, maxLength = 30) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {type === "surgical"
        ? (
          <>
            <p>
              <span style={labelStyle}>Año:</span> <span style={contentStyle}>{year}</span>
            </p>
            <p>
              <span style={labelStyle}>Tipo de Cirugía:</span>
              <span style={contentStyle}>{truncateText(surgeryType)}</span>
            </p>
          </>
        )
        : (
          <>
            <p>
              <span style={labelStyle}>Fecha:</span> <span style={contentStyle}>{date}</span>
            </p>
            <p>
              <span style={labelStyle}>Motivo de Consulta:</span>
              <span style={contentStyle}>{truncateText(reason)}</span>
            </p>
          </>
        )}
    </div>
  );
}
