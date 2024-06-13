/**
 * @typedef {Object} UserInformation
 * @property {string} displayName - The user display name.
 * @property {string} title - The role of this user in the application
 */

import { useNavigate } from "react-router-dom";

// NOTE: Remember to update the function signature when implementing the navigation to your view!
/**
 * @typedef {Object} DashboardSidebarProps
 * @property {Function} navigateToGeneral - Handles navigation to the update general patient information view.
 * @property {Function} navigateToAppointments - Handles navigation to the appointments view.
 * @property {Function} navigateToPersonal - Handles navigation to the update personal information view.
 * @property {Function} navigateToFamiliar - Handles navigation to the update familiar information view.
 * @property {Function} navigateToAllergies - Handles navigation to the update allergies view.
 * @property {Function} navigateToObstetrics - Handles navigation to the update obstetrics gynecologists view.
 * @property {Function} navigateToNonPathological - Handles navigation to the update non pathological view.
 * @property {Function} navigateToPsiquiatric - Handles navigation to the update psiquiatric view.
 * @property {Function} navigateToSurgical - Handles navigation to the update surgical view.
 * @property {Function} navigateToTraumatological - Handles navigation to the update traumatological view.
 * @property {Function} onGoBack - Function that fires when the Back button is pressed.
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
