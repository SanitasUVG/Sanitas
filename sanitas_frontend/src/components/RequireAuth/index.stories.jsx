import React from "react";
import { MemoryRouter } from "react-router-dom";
import { colors } from "src/theme.mjs";
import RequireAuth from ".";

export default {
  title: "Components/RequireAuth",
  component: RequireAuth,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

const getSessionErrMock = async () => {
  return { error: "Error!" };
};

export const AccessDenied = () => {
  return (
    <RequireAuth getSession={getSessionErrMock}>
      <div style={{ color: colors.errorColor }}>Acceso Denegado</div>
    </RequireAuth>
  );
};
