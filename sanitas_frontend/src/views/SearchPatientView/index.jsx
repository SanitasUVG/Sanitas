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
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts } from "src/theme.mjs";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import WrapPromise from "src/utils/promiseWrapper";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} PatientPreview
 * @property {string} id
 * @property {string} names
 */

/**
 * @typedef {Object} SearchPatientViewProps
 * @property {import("src/dataLayer.mjs").SearchPatientApiFunction} searchPatientsApiCall
 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {SearchPatientViewProps} props
 */
export default function SearchPatientView({ searchPatientsApiCall, useStore }) {
  const { query, type } = useStore((store) => store.searchQuery);
  const setSearchQuery = useStore((store) => store.setSearchQuery);
  const [patients, setPatients] = useStore((store) => [store.patients, store.setPatients]);
  const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);

  const [queryReturnedEmpty, setQueryReturnedEmpty] = useState(false);
  const [error, setError] = useState("");
  const [searchTypeWasCUI, setSearchTypeWasCUI] = useState(false);
  const [defaultView, setDefaultView] = useState(true);
  const [patientsResources, setPatientsResources] = useState(null);
  const { width, height } = useWindowSize();
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

    setPatientsResources(null);
    setQueryReturnedEmpty(false);
    setSearchTypeWasCUI(type === "CUI");

    const wrappedPatientsData = WrapPromise(searchPatientsApiCall(query, type));
    setPatientsResources(wrappedPatientsData);
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
        height: "100vh",
        width: "100vw",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          width: "100%",
          height: "100%",
        }}
      >
        {defaultView
          ? (
            <div
              style={{
                position: "relative",
                display: "grid",
                height: "100%",
              }}
            >
              <img
                style={{
                  width: adjustWidth(width, "25.43rem"),
                  height: "auto",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                src={BorderDecoUpper}
                alt="Borde decorativo superior"
              />
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
                    width: adjustWidth(width, "16rem"),
                    height: "auto",
                  }}
                  src={SanitasLogo}
                  alt="Logo Sanitas"
                />
                <h1
                  style={{
                    fontSize: adjustWidth(width, "3rem"),
                    paddingBottom: adjustHeight(height, "0.5rem"),
                    color: colors.titleText,
                  }}
                >
                  Búsqueda de Pacientes
                </h1>
                <h3
                  style={{
                    fontSize: adjustWidth(width, "1.75rem"),
                    fontFamily: "Lora, serif",
                    fontWeight: "normal",
                    paddingBottom: adjustHeight(height, "2rem"),
                    textAlign: "center",
                  }}
                >
                  Ingrese el carnet, código de trabajador, nombres o CUI
                </h3>

                <div
                  style={{
                    width: adjustWidth(width, "40rem"),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: adjustHeight(height, "0.5rem"),
                  }}
                >
                  <SearchInput
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Ingrese su búsqueda..."
                    style={{
                      input: {
                        width: adjustWidth(width, "30rem"),
                        height: adjustHeight(height, "1.75rem"),
                        fontSize: adjustWidth(width, "1.10rem"),
                      },
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                      paddingTop: adjustHeight(height, "1rem"),
                      gap: adjustHeight(height, "2rem"),
                    }}
                  >
                    <DropdownMenu
                      value={type}
                      onChange={(e) => setSearchQuery(query, e.target.value)}
                      options={dropdownOptions}
                      style={{
                        select: {
                          fontSize: adjustWidth(width, "1.10rem"),
                        },
                        container: {
                          width: adjustWidth(width, "14rem"),
                        },
                      }}
                    />

                    <BaseButton
                      text="Buscar Paciente"
                      onClick={async () => {
                        setDefaultView(defaultView ? false : true);
                        await searchBtnClick();
                      }}
                      disabled={emptyQuery}
                      style={{
                        fontSize: adjustWidth(width, "1.10rem"),
                        height: "2.65rem",
                        width: adjustWidth(width, "14rem"),
                      }}
                    />
                  </div>
                </div>
              </div>
              <IconButton
                icon={logoutIcon}
                onClick={doNothing}
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                }}
              />
              <img
                style={{
                  width: adjustWidth(width, "25.43rem"),
                  height: "auto",
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                }}
                src={BorderDecoLower}
                alt="Borde decorativo inferior"
              />
            </div>
          )
          : (
            <div
              style={{
                display: "flex",
              }}
            >
              <div
                style={{
                  width: adjustWidth(width, "17rem"),
                }}
              >
                <img
                  style={{
                    width: adjustWidth(width, "17rem"),
                    height: "auto",
                    paddingTop: adjustHeight(height, "2rem"),
                  }}
                  src={SanitasLogo}
                  alt="Logo Sanitas"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: adjustHeight(height, "1rem"),
                  }}
                >
                  <BaseButton
                    text="Nuevo Paciente"
                    onClick={onAddNewPatientClick}
                    style={{
                      fontSize: adjustWidth(width, "1.10rem"),
                      height: "2.65rem",
                      width: adjustWidth(width, "14rem"),
                    }}
                  />
                  <BaseButton
                    text="Regresar"
                    onClick={() => setDefaultView(true)}
                    style={{
                      fontSize: adjustWidth(width, "1.10rem"),
                      height: "2.65rem",
                      width: adjustWidth(width, "14rem"),
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: adjustWidth(width, "70%"),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {error && (
                  <div
                    style={{
                      color: colors.errorText,
                      marginBottom: adjustHeight(height, "1rem"),
                    }}
                  >
                    {error}
                  </div>
                )}
                {patientsResources
                  ? (
                    <Suspense fallback={<Throbber />}>
                      {patientsResources.map((patient) => (
                        <PatientCard
                          key={patient.id}
                          patient={patient}
                          onClick={genViewPatientBtnClick(patient.id)}
                        />
                      ))}
                      {queryReturnedEmpty && (
                        <div
                          style={{
                            fontSize: adjustWidth(width, "1.25rem"),
                            textAlign: "center",
                            marginTop: adjustHeight(height, "2rem"),
                          }}
                        >
                          No se encontraron resultados para su búsqueda.
                        </div>
                      )}
                    </Suspense>
                  )
                  : (
                    <div
                      style={{
                        fontSize: adjustWidth(width, "1.25rem"),
                        textAlign: "center",
                        marginTop: adjustHeight(height, "2rem"),
                      }}
                    >
                      {emptyQuery
                        ? (
                          "Por favor, ingrese algo para buscar."
                        )
                        : <Throbber />}
                    </div>
                  )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

const PatientSection = ({ patientsResources, genViewPatientBtnClick, setQueryReturnedEmpty }) => {
  const { width, height } = useWindowSize();
  return (
    <Suspense fallback={<Throbber loadingMessage="Cargando pacientes..." />}>
      <PatientCard
        patientsResources={patientsResources}
        genViewPatientBtnClick={genViewPatientBtnClick}
        adjustHeight={adjustHeight}
        adjustWidth={adjustWidth}
        setQueryReturnedEmpty={setQueryReturnedEmpty}
        style={{
          mainContainer: {
            borderRadius: adjustWidth(width, "1rem"),
            gap: adjustHeight(height, "2rem"),
          },
          secondaryContainer: {
            paddingLeft: adjustWidth(width, "3rem"),
            gap: adjustHeight(height, "1rem"),
          },
          cardsContainer: {
            minHeight: adjustHeight(height, "10rem"),
            borderRadius: adjustWidth(width, "1rem"),
          },
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
