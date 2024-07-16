import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginView from ".";

export default {
  component: LoginView,
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Story />} />
          </Routes>
        </MemoryRouter>
      );
    },
  ],
};

export const Default = {
  args: {},
};
