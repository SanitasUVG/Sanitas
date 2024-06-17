import logoutIcon from "@tabler/icons/outline/door-exit.svg";
import settingsIcon from "@tabler/icons/outline/settings.svg";
import React, { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import BorderDecoLower from "src/assets/images/BorderDecoLower.png";
import BorderDecoUpper from "src/assets/images/BorderDecoUpper.png";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import BaseButton from "src/components/Button/Base/index";
import IconButton from "src/components/Button/Icon";
import DropdownMenu from "src/components/DropdownMenu";
import { SearchInput } from "src/components/Input";
import PatientCard from "src/components/PatientCard";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { calculateYearsBetween, formatDate } from "src/utils/date";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} PatientPreview
 * @property {string} id
 * @property {string} names
 */

/**
 * @typedef {Object} SearchPatientViewProps
 * @property {import("src/dataLayer.mjs").SearchPatientApiFunction} searchPatientsApiCall
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getGeneralPatientInformation

 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {SearchPatientViewProps} props
 */
export default function SearchPatientView({
  searchPatientsApiCall,
  getGeneralPatientInformation,
  useStore,
}) {
  const { query, type } = useStore((store) => store.searchQuery);
  const setSearchQuery = useStore((store) => store.setSearchQuery);
  const [patients, setPatients] = useStore((store) => [store.patients, store.setPatients]);
  const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);

  const [queryReturnedEmpty, setQueryReturnedEmpty] = useState(false);
  const [error, setError] = useState("");
  const [searchTypeWasCUI, setSearchTypeWasCUI] = useState(false);
  const [defaultView, setDefaultView] = useState(true);
  const [addPatientState, setAddPatientState] = useState(false);
  const [generalInfoPatientsResources, setGeneralInfoPatientsResources] = useState(null);

  const navigate = useNavigate();

  const showErrorMessage = (message) => setError(`ERROR: ${message}`);
  const hideErrorMessage = () => setError("");

  const emptyQuery = query.trim().length <= 0;

  const dropdownOptions = [
    { value: "Carnet", label: "Carnet Estudiante" },
    { value: "NumeroColaborador", label: "Código Colaborador" },
    { value: "Nombres", label: "Nombres y Apellidos" },
    { value: "CUI", label: "CUI" },
  ];

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (type === "Nombres") {
      value = value.replace(/\d/g, "");
    } else if (type != "Nombres") {
      value = value.replace(/\D/g, "");
    }

    if (type === "CUI") {
      value = value.slice(0, 13);
    }
    setSearchQuery(value, type);
  };

  /**
   * Handles the search button click event by performing a patient search based on the query and type.
   * It makes an API call, processes the result, and updates the state based on the response.
   * It also handles error states by displaying appropriate error messages.
   *
   * @async
   * @function searchBtnClick
   * @returns {Promise<void>} Executes asynchronous operations related to the search functionality.
   */
  const searchBtnClick = async () => {
    hideErrorMessage();
    if (emptyQuery) {
      showErrorMessage("¡Por favor ingrese algo para buscar!");
      return;
    }

    try {
      const result = await searchPatientsApiCall(query, type);
      setSearchTypeWasCUI(type === "CUI");

      if (result.error) {
        const { error } = result;
        if (error.cause) {
          const { response } = error.cause;
          if (response?.status < 500) {
            showErrorMessage("Búsqueda incorrecta, ¡Por favor ingresa todos los parámetros!");
          } else {
            showErrorMessage("Ha ocurrido un error interno, lo sentimos.");
          }
        } else {
          showErrorMessage("The API has changed!");
        }
        return; // Stop further processing if there is an error
      }

      const { result: apiPatients } = result;
      setQueryReturnedEmpty(apiPatients.length <= 0);
      setPatients(apiPatients);

      if (apiPatients.length > 0) {
        const wrappedPatientsData = fetchAndProcessPatientData(apiPatients);
        setGeneralInfoPatientsResources(wrappedPatientsData);
      } else {
        setGeneralInfoPatientsResources(null);
      }
    } catch (error) {
      showErrorMessage("Error processing your search request.");
    }
  };

  /**
   * Represents detailed information about a patient.
   * @typedef {Object} PatientData
   * @property {string} id - The unique identifier for the patient.
   * @property {string} cui - The unique civil identification key of the patient.
   * @property {string} names - The first and middle names of the patient.
   * @property {string} lastNames - The last names or surname of the patient.
   * @property {number} age - The current age of the patient, calculated from their birthdate.
   */

  /**
   * Fetches and processes patient information asynchronously for a list of patients.
   * It first delays the fetching operation, retrieves general patient information for each patient,
   * and then maps and filters the results to return only valid patient data.
   *
   * @async
   * @function fetchAndProcessPatientData
   * @param {Array<Object>} apiPatients - An array of patient objects to fetch data for.
   * @returns {Promise<PatientData>} A wrapped promise containing the patient data after processing,
   *                                 which conforms to the PatientData type.
   */

  const fetchAndProcessPatientData = (apiPatients) => {
    const promise = (async () => {
      const results = await Promise.all(
        apiPatients.map((patient) => getGeneralPatientInformation(patient.id)),
      );

      return results
        .map((item) => {
          if (!item || !item.result) return null;
          const { id, cui, names, lastNames, birthdate } = item.result;
          const age = calculateYearsBetween(new Date(birthdate));
          return { id, cui, names, lastNames, age };
        })
        .filter((item) => item !== null);
    })();

    return WrapPromise(promise);
  };

  /**
   * @param {number} id - The ID of the selected patient.
   */
  const genViewPatientBtnClick = (id) => {
    return () => {
      setSelectedPatientId(id);
      navigate(NAV_PATHS.UPDATE_PATIENT);
    };
  };

  const onAddNewPatientClick = () => {
    navigate(NAV_PATHS.ADD_PATIENT, { state: { cui: query } });
  };

  const doNothing = () => {
    // This function does nothing
  };

  return (
    <div
      style={{
        backgroundColor: "#0F6838",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "row",
          width: "95%",
          height: "95%",
          textAlign: "left",
        }}
      >
        {defaultView
          ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  transform: "translate(-0.06rem, -0.7rem)",
                }}
              >
                <img
                  style={{
                    width: "25.43rem",
                    height: "20.75rem",
                  }}
                  src={BorderDecoUpper}
                  alt="Logo Sanitas"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <img
                  style={{
                    width: "16rem",
                    height: "auto",
                  }}
                  src={SanitasLogo}
                  alt="Logo Sanitas"
                />
                <h1 style={{ fontSize: "3rem", paddingBottom: "0.5rem", color: colors.titleText }}>
                  Búsqueda de Pacientes
                </h1>
                <h3
                  style={{
                    fontSize: "1.75rem",
                    fontFamily: "Lora, serif",
                    fontWeight: "normal",
                    paddingBottom: "2rem",
                  }}
                >
                  Ingrese carnet, código de trabajador, nombres o CUI del paciente
                </h3>

                <div
                  style={{
                    width: "40rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <SearchInput
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ingrese su búsqueda..."
                    style={{ input: { width: "35rem", height: "1.75rem", fontSize: "1.10rem" } }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                      paddingTop: "1rem",
                      gap: "2rem",
                    }}
                  >
                    <DropdownMenu
                      value={type}
                      onChange={(e) => setSearchQuery(query, e.target.value)}
                      options={dropdownOptions}
                      style={{
                        select: { fontSize: fontSize.textSize },
                        container: { width: "14rem" },
                      }}
                    />

                    <BaseButton
                      text="Buscar Paciente"
                      onClick={async () => {
                        setDefaultView(defaultView ? false : true);
                        await searchBtnClick();
                      }}
                      disabled={emptyQuery}
                      style={{ fontSize: "1.10rem", height: "2.65rem", width: "14rem" }}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1rem 7rem 8rem",
                  gridTemplateRows: "4.5rem 9rem 18rem 23.8rem",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gridColumnStart: 4,
                    gridRowStart: 2,
                    flexDirection: "column",
                    gap: "1rem",
                    padding: "1rem 1.5rem 1rem 2rem",
                  }}
                >
                  <IconButton icon={settingsIcon} onClick={doNothing} />
                  <IconButton icon={logoutIcon} onClick={doNothing} />
                </div>
                <img
                  style={{
                    width: "25rem",
                    height: "20rem",
                    gridRowStart: 4,
                    gridColumnStart: 2,
                    gridColumnEnd: 5,
                  }}
                  src={BorderDecoLower}
                  alt="Logo Sanitas"
                />
              </div>
            </>
          )
          : (
            <>
              <div style={{ width: "17rem" }}>
                <img
                  style={{
                    width: "17rem",
                    height: "auto",
                    paddingTop: "2rem",
                    paddingLeft: "2rem",
                  }}
                  src={SanitasLogo}
                  alt="Logo Sanitas"
                />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: "4.25rem",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                  paddingBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "2rem",
                  }}
                >
                  <SearchInput
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ingrese su búsqueda..."
                    style={{ input: { width: "35rem", height: "1.75rem", fontSize: "1.10rem" } }}
                  />
                  <DropdownMenu
                    value={type}
                    onChange={(e) => setSearchQuery(query, e.target.value)}
                    options={dropdownOptions}
                    style={{
                      select: { fontSize: fontSize.textSize },
                      container: { width: "14rem" },
                    }}
                  />
                  <BaseButton
                    text="Buscar Paciente"
                    onClick={async () => {
                      await searchBtnClick();
                    }}
                    disabled={emptyQuery}
                    style={{ fontSize: "1.10rem", height: "2.65rem", width: "14rem" }}
                  />
                </div>
                <div style={{ height: "100%" }}>
                  <h1
                    style={{
                      fontSize: fontSize.titleSize,
                      paddingBottom: "1.5rem",
                      paddingTop: "2rem",
                      color: colors.titleText,
                    }}
                  >
                    Resultados de la Búsqueda
                  </h1>
                  {queryReturnedEmpty
                    && (!searchTypeWasCUI
                      ? (
                        <div>
                          <p>¡Parece que el paciente no existe!</p>
                          <p>Prueba buscarlo por CUI.</p>
                        </div>
                      )
                      : (
                        <div>
                          <p>Ingresa la información del paciente aquí.</p>
                          <BaseButton
                            text="Ingresar la información del paciente."
                            onClick={onAddNewPatientClick}
                          />
                        </div>
                      ))}
                  {error && <div style={{ color: "red" }}>{error}</div>}
                  {!error && PatientSection({ generalInfoPatientsResources, genViewPatientBtnClick })}
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

const LoadingView = () => {
  return (
    <div
      style={{
        width: "70%",
        height: "85%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        paddingBottom: "7rem",
      }}
    >
      <div style={{ width: "17rem" }}>
        <img
          style={{
            width: "17rem",
            height: "auto",
          }}
          src={SanitasLogo}
          alt="Logo Sanitas"
        />
      </div>

      <div
        style={{
          color: colors.primaryBackground,
          fontSize: "2rem",
          textAlign: "center",
          fontFamily: fonts.textFont,
        }}
      >
        Loading patients...
      </div>
    </div>
  );
};

const PatientSection = ({ generalInfoPatientsResources, genViewPatientBtnClick }) => {
  return (
    <Suspense fallback={<LoadingView />}>
      <PatientCard
        generalInfoPatientsResources={generalInfoPatientsResources}
        genViewPatientBtnClick={genViewPatientBtnClick}
        style={{
          patientName: {
            fontFamily: fonts.textFont,
          },
          patientAge: {
            fontFamily: fonts.textFont,
          },
          patientCUI: {
            fontFamily: fonts.textFont,
          },
        }}
      >
      </PatientCard>
    </Suspense>
  );
};
