import saveIcon from "@tabler/icons/outline/device-floppy.svg";
import editIcon from "@tabler/icons/outline/pencil.svg";
import cancelIcon from "@tabler/icons/outline/x.svg";
import { Fragment, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BaseButton from "src/components/Button/Base";
import IconButton from "src/components/Button/Icon";
import DashboardSidebar from "src/components/DashboardSidebar";
import { BaseInput } from "src/components/Input";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
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
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateStudentPatientInformation
 * @property {import("src/dataLayer.mjs").GetStudentPatientInformationAPICall} getStudentPatientInformation
 */

/**
 * @param {UpdatePatientViewProps} props
 */
export default function UpdateInfoView(
  {
    getGeneralPatientInformation,
    updateGeneralPatientInformation,
    sidebarConfig,
    useStore,
    getStudentPatientInformation,
    updateStudentPatientInformation,
  },
) {
  const id = useStore((s) => s.selectedPatientId);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "20% 80%",
      }}
    >
      <DashboardSidebar {...sidebarConfig} />
      <div>
        <UpdateGeneralInformationSection
          patientId={id}
          getData={getGeneralPatientInformation}
          updateData={updateGeneralPatientInformation}
        />
        <UpdateColaboratorInformationSection patientId={id} />
        <UpdateStudentInformationSection
          patientId={id}
          getData={getStudentPatientInformation}
          updateData={updateStudentPatientInformation}
        />
      </div>
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
  // const getData2 = async () => {
  //   await delay(3000);
  //   return await getData(patientId);
  // };
  const generalInformationResource = WrapPromise(getData(patientId));
  // const generalInformationResource = WrapPromise(getData2());

  const Hijo = () => {
    const response = generalInformationResource.read();
    if (response.error) {
      // FIXME: Manejar el error al obtener la data!
      return (
        <div>
          <h1>Error al buscar el paciente. Asegúrese de que el ID es correcto.</h1>
          <p>{response.error.toString()}</p>
        </div>
      );
    }

    const [patientData, setPatientData] = useState({
      ...response.result,
      birthdate: formatDate(response.result.birthdate),
    });
    const handleUpdatePatient = async () => {
      const updateInformationResource = WrapPromise(updateData(patientData));
      const response = updateInformationResource.read();
      if (response.error) {
        // FIXME: Manejar el error al actualizar datos!
      }

      // NOTE: Los datos fueron actualizados!
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

/**
 * @typedef {Object} UpdateStudentInformationSectionProps
 * @property {number} patientId
 * @property {import("src/dataLayer.mjs").GetStudentPatientInformationAPICall} getData
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateData
 */

/**
 * @param {UpdateStudentInformationSectionProps} props
 */
function UpdateStudentInformationSection({ patientId, getData, updateData }) {
  /** @type React.CSSProperties */
  const h1Styles = {
    fontFamily: fonts.titleFont,
    fontSize: fonts.textFont,
  };
  /** @type React.CSSProperties */
  const errorPStyles = {
    fontFamily: fonts.textFont,
    fontSize: fontSize.textSize,
    color: colors.statusDenied,
  };
  /** @type React.CSSProperties */
  const normalTextStyle = {
    fontFamily: fonts.textFont,
    fontSize: fontSize.textSize,
    color: colors.primaryText,
  };

  const delayedGet = async () => {
    // await delay(5000);
    return await getData(patientId);
  };
  const resourceGet = WrapPromise(delayedGet());

  const Hijo = () => {
    const response = resourceGet.read();
    const [isEditable, setIsEditable] = useState(false);

    /** @type React.MouseEventHandler<HTMLInputElement> */
    const preventFocusIfNotEditable = (e) => {
      isEditable && e.preventDefault();
    };

    /** @type [import("src/dataLayer.mjs").APIStudentInformation, (newInfo: import("src/dataLayer.mjs").APIStudentInformation)=>void] */
    const [info, setInfo] = useState(response.result);
    const [resourceUpdate, setResourceUpdate] = useState(null);
    const [carnet, setCarnet] = useState(info?.carnet);
    const [career, setCareer] = useState(info?.career);
    const [updateError, setUpdateError] = useState("");

    if (resourceUpdate !== null) {
      const response = resourceUpdate.read();

      setUpdateError("");
      if (response.error) {
        setUpdateError(`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${response.error.toString()}`);
      } else {
        setIsEditable(false);
        setInfo(response.result);
      }
      setResourceUpdate(null);
    }

    const handleUpdateInformation = () => {
      const newInfo = { ...info, carnet, career };
      setResourceUpdate(WrapPromise(updateData(newInfo)));
    };

    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "1rem",
          }}
        >
          <h1 style={h1Styles}>Datos de Estudiante:</h1>
          {isEditable
            ? (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <IconButton
                  icon={saveIcon}
                  onClick={handleUpdateInformation}
                />
                <IconButton
                  icon={cancelIcon}
                  onClick={() => {
                    setIsEditable(false);
                    setCarnet(info.carnet);
                    setCareer(info.career);
                  }}
                />
              </div>
            )
            : (
              <IconButton
                icon={editIcon}
                onClick={() => setIsEditable(true)}
              />
            )}
        </div>
        {response.error
          ? (
            <div>
              <p style={errorPStyles}>Lo sentimos! Ha ocurrido un error al cargar la información.</p>
              <p style={errorPStyles}>{response.error.toString()}</p>
            </div>
          )
          : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "30% 30% ",
                rowGap: "0.5rem",
                columnGap: "2rem",
              }}
            >
              <label style={normalTextStyle}>Carnet:</label>
              <label style={normalTextStyle}>Carrera:</label>
              <BaseInput
                value={carnet}
                onClick={preventFocusIfNotEditable}
                onChange={(e) => isEditable && setCarnet(e.target.value)}
                placeholder="Carnet"
              />
              <BaseInput
                value={career}
                onClick={preventFocusIfNotEditable}
                onChange={(e) => isEditable && setCareer(e.target.value)}
                placeholder="Carrera"
              />
            </div>
          )}
        <p style={errorPStyles}>{updateError}</p>
      </>
    );
  };

  const LoadingView = () => {
    return (
      <div>
        <h1 style={h1Styles}>Datos de Estudiante:</h1>
        <p style={normalTextStyle}>Cargando datos...</p>
      </div>
    );
  };

  return (
    <div>
      <Suspense fallback={<LoadingView />}>
        <Hijo />
      </Suspense>
    </div>
  );
}
