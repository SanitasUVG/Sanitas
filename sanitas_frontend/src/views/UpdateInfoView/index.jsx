import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_PATHS } from "src/router";
const DEV_URL = "http://localhost:3000";
const BASE_URL = process.env.BACKEND_URL ?? DEV_URL;

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

export default function UpdateInfoView() {
  const navigate = useNavigate();
  // const location = useLocation();
  const id = 1; // Obtener el ID del paciente desde el estado de la navegación
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");

  const handleBack = () => {
    navigate(NAV_PATHS.SEARCH_PATIENT);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/patient/general/1`);
      const result = response.data;

      setPatientData({
        id: result.id,
        nombres: result.names,
        apellidos: result.lastNames,
        isWoman: result.isWoman,
        email: result.email,
        contactName1: result.contactName1,
        contactKinship1: result.contactKinship1,
        contactPhone1: result.contactPhone1,
        contactName2: result.contactName2,
        contactKinship2: result.contactKinship2,
        contactPhone2: result.contactPhone2,
        bloodType: result.bloodType,
        address: result.address,
        insuranceId: result.insuranceId,
        birthdate: formatDate(result.birthdate),
        phone: result.phone,
      });
      setError("");
    } catch (error) {
      setError("Error al buscar el paciente. Asegúrese de que el ID es correcto." + error);
    }
  };

  // Ejecutar la búsqueda si el ID está presente al montar el componente
  useState(() => {
    if (id) {
      handleSearch();
    }
  }, [id]);

  return (
    <div>
      <h1>Actualizar información del paciente</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {patientData
        ? (
          <form>
            <div>
              <label>
                Nombres:
                <input
                  type="text"
                  value={patientData.nombres}
                  onChange={(e) => setPatientData({ ...patientData, nombres: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Apellidos:
                <input
                  type="text"
                  value={patientData.apellidos}
                  onChange={(e) => setPatientData({ ...patientData, apellidos: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Género:
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
            <button type="button">
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
