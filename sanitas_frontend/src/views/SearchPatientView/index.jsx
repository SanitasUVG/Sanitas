import logoutIcon from "@tabler/icons/outline/door-exit.svg";
import settingsIcon from "@tabler/icons/outline/settings.svg";
import React, { Suspense, useEffect, useState } from "react";
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
import { delay } from "src/utils/general";
import WrapPromise from "src/utils/promiseWrapper";
import useWindowSize from "src/utils/useWindowSize";

/**
 * Adjusts the REM values based on the width of the screen.
 * The function scales the input REM values by a scaleFactor determined by the screen width.
 *
 * @param {number} width - The current width of the screen in pixels.
 * @param {string} remValues - A string containing space-separated REM values to be adjusted.
 * @returns {string} A string of space-separated REM values adjusted based on the screen width.
 * @example
 * // returns "9.300rem 18.600rem"
 * adjustWidth(1400, "10rem 20rem");
 */
const adjustWidth = (width, remValues) => {
  let scaleFactor;
  if (width >= 1538) {
    scaleFactor = 1.0;
  } else if (width >= 1440) {
    scaleFactor = 0.93;
  } else if (width >= 1280) {
    scaleFactor = 0.83;
  } else {
    scaleFactor = 1.0;
  }

  return remValues
    .split(" ")
    .map((rem) => {
      const value = Number.parseFloat(rem) * scaleFactor;
      return `${value.toFixed(3)}rem`;
    })
    .join(" ");
};

/**
 * Adjusts the REM values based on the height of the screen.
 * The function scales the input REM values by a scaleFactor determined by the screen height.
 *
 * @param {number} height - The current height of the screen in pixels.
 * @param {string} remValues - A string containing space-separated REM values to be adjusted.
 * @returns {string} A string of space-separated REM values adjusted based on the screen height.
 * @example
 * // returns "9.400rem 18.800rem"
 * adjustHeight(850, "10rem 20rem");
 */
const adjustHeight = (height, remValues) => {
  let scaleFactor;
  if (height >= 950) {
    scaleFactor = 1.0;
  } else if (height >= 900) {
    scaleFactor = 0.94;
  } else if (height >= 800) {
    scaleFactor = 0.84;
  } else {
    scaleFactor = 1.0;
  }

  return remValues
    .split(" ")
    .map((rem) => {
      const value = Number.parseFloat(rem) * scaleFactor;
      return `${value.toFixed(3)}rem`;
    })
    .join(" ");
};

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

    try {
      const apiCallPromise = searchPatientsApiCall(query, type);
      setSearchTypeWasCUI(type === "CUI");

      const wrappedPatientsData = WrapPromise(apiCallPromise);
      setPatientsResources(wrappedPatientsData);

      const result = await apiCallPromise;

      if (result.error) {
        throw result;
      }

      const apiPatients = result.result;
      setQueryReturnedEmpty(apiPatients.length <= 0);
      if (apiPatients.length > 0) {
        setPatients(apiPatients);
      } else {
        setPatientsResources(null);
      }
    } catch (error) {
      if (error.error && error.error.cause) {
        const { response } = error.error.cause;
        if (response?.status < 500) {
          showErrorMessage("Búsqueda incorrecta, ¡Por favor ingresa todos los parámetros!");
        } else {
          showErrorMessage("Ha ocurrido un error interno, lo sentimos.");
        }
      } else {
        showErrorMessage("Error processing your search request.");
      }
    }
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
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
              >
                <img
                  style={{
                    width: adjustWidth(width, "25.43rem"),
                    height: "auto",
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
                  Ingrese carnet, código de trabajador, nombres o CUI del paciente
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
              <div
                style={{
                  display: "grid",
                  width: "80%",
                  height: "100%",
                  gridTemplateColumns: adjustWidth(width, "1rem 7rem 8rem"),
                  gridTemplateRows: adjustHeight(height, "4.5rem 9rem 18rem") + " 1fr",
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
                    gap: adjustHeight(height, "1rem"),
                    padding: adjustWidth(width, "0.9rem 1.5rem 1rem 2rem"),
                  }}
                >
                  <IconButton icon={settingsIcon} onClick={doNothing} />
                  <IconButton icon={logoutIcon} onClick={doNothing} />
                </div>
                <img
                  style={{
                    width: adjustWidth(width, "25.43rem"),
                    height: "auto",
                    gridRowStart: 4,
                    gridColumnStart: width >= 1660 ? 3 : 2,
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
                    paddingLeft: adjustWidth(width, "2rem"),
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
                  paddingTop: adjustHeight(height, "4.25rem"),
                  paddingLeft: adjustWidth(width, "2rem"),
                  paddingRight: adjustWidth(width, "2rem"),
                  paddingBottom: adjustHeight(height, "2rem"),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: adjustHeight(height, "2rem"),
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
                <div style={{ height: "100%" }}>
                  <h1
                    style={{
                      fontSize: adjustWidth(width, "2rem"),
                      paddingBottom: adjustHeight(height, "1.5rem"),
                      paddingTop: adjustHeight(height, "2rem"),
                      color: colors.titleText,
                    }}
                  >
                    Resultados de la Búsqueda
                  </h1>
                  {queryReturnedEmpty
                    && !patientsResources
                    && (!searchTypeWasCUI
                      ? (
                        <div
                          style={{
                            width: "70%",
                            height: "85%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            paddingBottom: adjustHeight(height, "7rem"),
                          }}
                        >
                          <div
                            style={{
                              width: adjustWidth(width, "28rem"),
                              height: "auto",
                              padding: adjustWidth(width, "1rem"),
                              borderRadius: adjustWidth(width, "1rem"),
                              gap: adjustHeight(height, "1rem"),
                            }}
                          >
                            <p
                              style={{
                                color: colors.textPrimary,
                                fontSize: adjustWidth(width, "1.75rem"),
                                textAlign: "center",
                                fontFamily: fonts.textFont,
                              }}
                            >
                              ¡Parece que el paciente no existe!
                            </p>
                            <p
                              style={{
                                color: colors.textPrimary,
                                fontSize: adjustWidth(width, "1.75rem"),
                                textAlign: "center",
                                fontFamily: fonts.textFont,
                                fontWeight: "bold",
                              }}
                            >
                              Prueba buscarlo por CUI.
                            </p>
                          </div>
                        </div>
                      )
                      : (
                        <div
                          style={{
                            width: "70%",
                            height: "85%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            paddingBottom: adjustHeight(height, "7rem"),
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              width: adjustWidth(width, "33rem"),
                              height: "90%",
                              borderRadius: adjustWidth(width, "1rem"),
                              gap: adjustHeight(height, "0.5rem"),
                            }}
                          >
                            <p
                              style={{
                                color: colors.textPrimary,
                                fontSize: adjustWidth(width, "1.75rem"),
                                textAlign: "center",
                                fontFamily: fonts.textFont,
                              }}
                            >
                              ¡Parece que el paciente no existe!
                            </p>
                            <p
                              style={{
                                color: colors.textPrimary,
                                fontSize: adjustWidth(width, "1.75rem"),
                                textAlign: "center",
                                fontFamily: fonts.textFont,
                                paddingBottom: adjustHeight(height, "2rem"),
                              }}
                            >
                              Ingresa la información del paciente aquí.
                            </p>
                            <BaseButton
                              text="Ingresar la información del paciente."
                              onClick={onAddNewPatientClick}
                              style={{
                                fontSize: adjustWidth(width, "1.10rem"),
                                height: "2.65rem",
                                width: adjustWidth(width, "25rem"),
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  {(error || (error && emptyQuery)) && (
                    <div
                      style={{
                        width: "70%",
                        height: "85%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        paddingBottom: adjustHeight(height, "7rem"),
                      }}
                    >
                      <div
                        style={{
                          width: adjustWidth(width, "25rem"),
                          fontSize: adjustWidth(width, "2rem"),
                          textAlign: "center",
                          fontFamily: fonts.textFont,
                          color: colors.statusDenied,
                        }}
                      >
                        {error}
                      </div>
                    </div>
                  )}
                  {!error && patientsResources && (
                    <PatientSection
                      patientsResources={patientsResources}
                      genViewPatientBtnClick={genViewPatientBtnClick}
                    />
                  )}
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

const LoadingView = () => {
  const { width, height } = useWindowSize();

  return (
    <div
      style={{
        width: "70%",
        height: "85%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        paddingBottom: adjustHeight(height, "7rem"),
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
          }}
          src={SanitasLogo}
          alt="Logo Sanitas"
        />
      </div>

      <div
        style={{
          color: colors.primaryBackground,
          fontSize: adjustWidth(width, "2rem"),
          textAlign: "center",
          fontFamily: fonts.textFont,
        }}
      >
        Loading patients...
      </div>
    </div>
  );
};

const PatientSection = ({ patientsResources, genViewPatientBtnClick }) => {
  const { width, height } = useWindowSize();
  return (
    <Suspense fallback={<LoadingView />}>
      <PatientCard
        patientsResources={patientsResources}
        genViewPatientBtnClick={genViewPatientBtnClick}
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
            height: adjustHeight(height, "10rem"),
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
