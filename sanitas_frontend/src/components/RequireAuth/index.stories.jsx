import React from "react";
import { MemoryRouter } from "react-router-dom"; // Para emular la navegación
import RequireAuth from "src/components/RequireAuth"; // Asegúrate de que la ruta es correcta
import { colors } from "src/theme.mjs"; // Importa tu tema o colores

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

export const AccessDenied = () => {
  return (
    <RequireAuth>
      <div style={{ color: colors.errorColor }}>Acceso Denegado</div>
    </RequireAuth>
  );
};
