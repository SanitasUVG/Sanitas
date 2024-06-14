import { Fragment, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "src/components/DashboardSidebar";
import { NAV_PATHS } from "src/router";
import { formatDate } from "src/utils/date";
import { delay } from "src/utils/general";
import WrapPromise from "src/utils/promiseWrapper";

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
  const id = useStore((s) => s.selectedPatientId);

  return (
    <div>
      <DashboardSidebar {...sidebarConfig} />
      <UpdateGeneralInformationSection
        patientId={id}
        getData={getGeneralPatientInformation}
        updateData={updateGeneralPatientInformation}
      />
      <UpdateColaboratorInformationSection patientId={id} />
      <UpdateStudentInformationSection patientId={id} />
    </div>
  );
}

function UpdateColaboratorInformationSection() {
}

/**
 * @typedef {Object} UpdateGeneralInformationSectionProps
 * @property {number} patientId
 * @property {Function} getData
 * @property {Function} updateData
 */

/**
 * @param {UpdateGeneralInformationSectionProps} props
 */
function UpdateGeneralInformationSection({ patientId, getData, updateData }) {
  const getData2 = async () => {
    await delay(3000);
    return await getData(patientId);
  };
  // const generalInformationResource = WrapPromise(getData(patientId))
  const generalInformationResource = WrapPromise(getData2());

  const Hijo = () => {
    const response = generalInformationResource.read();
    if (response.error) {
      // FIXME: Manejar el error al obtener la data!
    }

    const [patientData, setPatientData] = useState({
      ...response.result,
      birthdate: formatDate(response.result.birthdate),
    });
    const handleUpdatePatient = async () => {
      try {
        await updateGeneralPatientInformation(patientData);
        setError("");
      } catch (error) {
        // FIXME: Manejar el error al actualizar datos!
        //
        // setError("Error al actualizar el paciente. Asegúrese de ingresar datos válidos." + error);
      }
    };

    return (
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
    );
  };

  const LoadingView = () => {
    return <div>Cargando información del paciente...</div>;
  };

  return (
    <div>
      <h1>Actualizar información del paciente</h1>
      <Suspense fallback={<LoadingView />}>
        <Hijo resource={generalInformationResource} />
      </Suspense>
    </div>
  );
}

function UpdateStudentInformationSection() {
}
