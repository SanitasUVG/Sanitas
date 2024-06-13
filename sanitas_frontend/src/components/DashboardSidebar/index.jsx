/**
 * @typedef {Object} UserInformation
 * @property {string} displayName - The user display name.
 * @property {string} title - The role of this user in the application
 */

import { useNavigate } from "react-router-dom";

/**
 * @callback SidebarNavigationHandler
 * @param {import("react-router-dom").NavigateFunction} navigate - The navigate returned from `useNavigate()`
 * @param {import("react").MouseEvent} e - The `MouseEvent` that triggered this handler.
 */

// NOTE: Remember to update the function signature when implementing the navigation to your view!
/**
 * @typedef {Object} DashboardSidebarProps
 * @property {SidebarNavigationHandler} navigateToGeneral - Handles navigation to the update general patient information view.
 * @property {SidebarNavigationHandler} navigateToAppointments - Handles navigation to the appointments view.
 * @property {SidebarNavigationHandler} navigateToPersonal - Handles navigation to the update personal information view.
 * @property {SidebarNavigationHandler} navigateToFamiliar - Handles navigation to the update familiar information view.
 * @property {SidebarNavigationHandler} navigateToAllergies - Handles navigation to the update allergies view.
 * @property {SidebarNavigationHandler} navigateToObstetrics - Handles navigation to the update obstetrics gynecologists view.
 * @property {SidebarNavigationHandler} navigateToNonPathological - Handles navigation to the update non pathological view.
 * @property {SidebarNavigationHandler} navigateToPsiquiatric - Handles navigation to the update psiquiatric view.
 * @property {SidebarNavigationHandler} navigateToSurgical - Handles navigation to the update surgical view.
 * @property {SidebarNavigationHandler} navigateToTraumatological - Handles navigation to the update traumatological view.
 * @property {SidebarNavigationHandler} onGoBack - Function that fires when the Back button is pressed.
 * @property {UserInformation} userInformation - Contains some information to display about a user.
 */

/**
 * @param {DashboardSidebarProps} props
 */
export default function DashboardSidebar(
  {
    navigateToGeneral,
    navigateToAppointments,
    navigateToPersonal,
    navigateToFamiliar,
    navigateToAllergies,
    navigateToObstetrics,
    navigateToNonPathological,
    navigateToPsiquiatric,
    navigateToSurgical,
    navigateToTraumatological,
    userInformation,
    onGoBack,
  },
) {
  const navigate = useNavigate();
  const wrapWithNavigate = (func) => {
    /**
     * @type {import("react").MouseEventHandler}
     */
    return (e) => {
      func(navigate, e);
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button type="button" onMouseDown={wrapWithNavigate(onGoBack)}>Go Back</button>
      {/* TODO: Add the Sanitas logo src! */}
      <img alt="Sanitas logo" src="" />
      <h1>{userInformation.displayName}</h1>
      <h2>{userInformation.title}</h2>

      <button type="button" onMouseDown={wrapWithNavigate(navigateToGeneral)}>General</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToAppointments)}>Citas</button>

      <hr />
      <h3>Antecedentes</h3>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToAllergies)}>Alérgicos</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToFamiliar)}>Familiares</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToObstetrics)}>Ginecoobstétricos</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToNonPathological)}>No patológicos</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToPersonal)}>Personales</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToPsiquiatric)}>Psiquiátricos</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToSurgical)}>Quirúrgicos</button>
      <button type="button" onMouseDown={wrapWithNavigate(navigateToTraumatological)}>Traumatológicos</button>
    </div>
  );
}
