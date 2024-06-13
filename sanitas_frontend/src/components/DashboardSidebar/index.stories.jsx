import { action } from "@storybook/addon-actions";
import { MemoryRouter } from "react-router-dom";
import DashboardSidebar from ".";

export default {
  title: "Components/DashboardSidebar",
  component: DashboardSidebar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

/**
 * @param {import (".").DashboardSidebarProps} args
 */
const DashboardSidebarTemplate = (args) => {
  return <DashboardSidebar {...args} />;
};

export const Default = DashboardSidebarTemplate.bind({});

/**
 * @type {import(".").DashboardSidebarProps}
 */
Default.args = {
  userInformation: {
    displayName: "Jennifer Bustamante",
    title: "Doctora UVG",
  },
  onGoBack: action("Go Back Clicked!"),
};
