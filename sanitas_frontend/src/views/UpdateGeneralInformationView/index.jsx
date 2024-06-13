import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "src/components/DashboardSidebar";
import { NAV_PATHS } from "src/router";

/**
 * @typedef {Object} PatientInfo
 * @property {number} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 * @property {string|null} contactName2
 * @property {string|null} contactKinship2
 * @property {string|null} contactPhone2
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {number | undefined} insuranceId
 * @property {string} birthdate
 * @property {string|null} phone
 */

/**
 * @typedef {Object} UpdatePatientViewProps
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getGeneralPatientInformation
 * @property {import("src/dataLayer.mjs").updateGeneralPatientInformation} updateGeneralPatientInformation
 * @property {import("src/components/DashboardSidebar").DashboardSidebarProps} sidebarConfig - The config for the view sidebar
 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {UpdatePatientViewProps} props
 */
export default function UpdateInfoView(
  { getGeneralPatientInformation, updateGeneralPatientInformation, sidebarConfig, useStore },
) {
  const navigate = useNavigate();
  const id = useStore((s) => s.selectedPatientId);

  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");

  const handleBack = () => {
    navigate(NAV_PATHS.SEARCH_PATIENT);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    try {
      const { result: response } = await getGeneralPatientInformation(id);
      setPatientData({
        id: response.id,
        cui: response.cui,
        names: response.names,
        lastNames: response.lastNames,
        isWoman: response.isWoman,
        email: response.email,
        contactName1: response.contactName1,
        contactKinship1: response.contactKinship1,
        contactPhone1: response.contactPhone1,
        contactName2: response.contactName2,
        contactKinship2: response.contactKinship2,
        contactPhone2: response.contactPhone2,
        bloodType: response.bloodType,
        address: response.address,
        insuranceId: response.insuranceId,
        birthdate: formatDate(response.birthdate),
        phone: response.phone,
      });
      setError("");
    } catch (error) {
      setError("Error al buscar el paciente. Asegúrese de que el ID es correcto." + error);
    }
  };

  const handleUpdatePatient = async () => {
    try {
      await updateGeneralPatientInformation(patientData);
      setError("");
    } catch (error) {
      setError("Error al actualizar el paciente. Asegúrese de ingresar datos válidos." + error);
    }
  };

  // Ejecutar la búsqueda si el ID está presente al montar el componente
  useEffect(() => {
    if (typeof id === "number") {
      handleSearch();
    }
  }, [id]);

  return (
    <div value={error}>
      <DashboardSidebar {...sidebarConfig} />
      <h1>Actualizar información del paciente</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {patientData
        ? (
          <form>
            <div>
              <label>
                CUI:
                <input
                  type="text"
                  value={patientData.cui}
                  onChange={(e) => setPatientData({ ...patientData, cui: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Nombres:
                <input
                  type="text"
                  value={patientData.names}
                  onChange={(e) => setPatientData({ ...patientData, names: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Apellidos:
                <input
                  type="text"
                  value={patientData.lastNames}
                  onChange={(e) => setPatientData({ ...patientData, lastNames: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Sexo:
                <div>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={!patientData.isWoman}
                      onChange={() => setPatientData({ ...patientData, isWoman: false })}
                    />
                    Masculino
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={patientData.isWoman}
                      onChange={() => setPatientData({ ...patientData, isWoman: true })}
                    />
                    Femenino
                  </label>
                </div>
              </label>
            </div>
            <div>
              <label>
                Email:
                <input
                  type="email"
                  value={patientData.email || ""}
                  onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Nombre de contacto 1:
                <input
                  type="text"
                  value={patientData.contactName1 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactName1: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Parentesco de contacto 1:
                <input
                  type="text"
                  value={patientData.contactKinship1 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactKinship1: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Teléfono de contacto 1:
                <input
                  type="text"
                  value={patientData.contactPhone1 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactPhone1: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Nombre de contacto 2:
                <input
                  type="text"
                  value={patientData.contactName2 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactName2: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Parentesco de contacto 2:
                <input
                  type="text"
                  value={patientData.contactKinship2 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactKinship2: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Teléfono de contacto 2:
                <input
                  type="text"
                  value={patientData.contactPhone2 || ""}
                  onChange={(e) => setPatientData({ ...patientData, contactPhone2: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Tipo de sangre:
                <select
                  value={patientData.bloodType || ""}
                  onChange={(e) => setPatientData({ ...patientData, bloodType: e.target.value })}
                >
                  <option value="">Selecciona un tipo de sangre</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                Dirección:
                <input
                  type="text"
                  value={patientData.address || ""}
                  onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                ID del seguro:
                <input
                  type="number"
                  value={patientData.insuranceId || ""}
                  onChange={(e) => setPatientData({ ...patientData, insuranceId: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Fecha de nacimiento:
                <input
                  type="date"
                  value={patientData.birthdate}
                  onChange={(e) => setPatientData({ ...patientData, birthdate: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Teléfono:
                <input
                  type="text"
                  value={patientData.phone || ""}
                  onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                />
              </label>
            </div>
            <button type="button" onClick={handleUpdatePatient}>
              Actualizar
            </button>
          </form>
        )
        : <div>Cargando información del paciente...</div>}
      <button type="button" onClick={handleBack}>
        Volver
      </button>
    </div>
  );
}
