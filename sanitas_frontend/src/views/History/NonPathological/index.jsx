import React, { Suspense, useEffect, useMemo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import IconButton from "src/components/Button/Icon";
import DashboardSidebar from "src/components/DashboardSidebar";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * Component responsible for managing and displaying non-pathological history information of a patient.
 * It uses various subcomponents and utilities to display the data and handle state management.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.getNonPathologicalHistory - Function to fetch non-pathological history data.
 * @param {Function} props.getBloodTypePatientInfo - Function to fetch blood type information of the patient.
 * @param {Function} props.updateNonPathologicalHistory - Function to update the non-pathological history.
 * @param {Object} props.sidebarConfig - Configuration properties for the sidebar component.
 * @param {Function} props.useStore - Custom hook for accessing the global state to retrieve the selected patient ID.
 * @returns {JSX.Element} The NonPathologicalHistory component visual structure.
 */
export function NonPathologicalHistory({
  getNonPathologicalHistory,
  getBloodTypePatientInfo,
  updateNonPathologicalHistory,
  sidebarConfig,
  useStore,
}) {
  const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

  // Fetching patient ID from global state
  const id = useStore((s) => s.selectedPatientId);

  // Memoizing resources for blood type and history to avoid refetching unless ID changes or a reload is triggered
  const bloodTypeResource = useMemo(() => WrapPromise(getBloodTypePatientInfo(id)), [id, reload]);
  const nonPathologicalHistoryResource = useMemo(
    () => WrapPromise(getNonPathologicalHistory(id)),
    [id, reload],
  );

  // Triggers a state change to force reloading of data
  const triggerReload = () => {
    setReload((prev) => !prev);
  };

  // Suspense fallback component
  const LoadingView = () => {
    return <Throbber loadingMessage="Cargando información de los antecedentes no patológicos..." />;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: colors.primaryBackground,
        height: "100vh",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "25%",
        }}
      >
        <DashboardSidebar {...sidebarConfig} />
      </div>

      <div
        style={{
          paddingLeft: "2rem",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: colors.secondaryBackground,
            padding: "3.125rem",
            height: "100%",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                color: colors.titleText,
                fontFamily: fonts.titleFont,
                fontSize: fontSize.titleSize,
              }}
            >
              Antecedentes No Patológicos
            </h1>
            <h3
              style={{
                fontFamily: fonts.textFont,
                fontWeight: "normal",
                fontSize: fontSize.subtitleSize,
                paddingTop: "0.5rem",
                paddingBottom: "3rem",
              }}
            >
              Registro de antecedentes no patológicos
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-align",
              alignItems: "space-between",
              width: "100%",
              gap: "2rem",
            }}
          >
            <Suspense fallback={<LoadingView />}>
              <NonPathologicalView
                id={id}
                nonPathologicalHistoryResource={nonPathologicalHistoryResource}
                bloodTypeResource={bloodTypeResource}
                updateNonPathologicalHistory={updateNonPathologicalHistory}
                triggerReload={triggerReload}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders and manages the UI for displaying and editing non-pathological health records of a patient.
 * Handles user inputs, displays current health records, and allows modifications.
 *
 * @typedef {Object} NonPathologicalViewProps
 * @property {string} id - Unique identifier for the patient.
 * @property {Object} nonPathologicalHistoryResource - Promise-based resource for non-pathological history data.
 * @property {Object} bloodTypeResource - Promise-based resource for blood type data.
 * @property {Function} updateNonPathologicalHistory - Function to update the non-pathological history records.
 * @property {Function} triggerReload - Function to trigger reloading of data.
 *
 * @param {NonPathologicalViewProps} props - Props passed to NonPathologicalView component.
 * @returns {JSX.Element} - Rendered view for managing non-pathological history.
 */
function NonPathologicalView({
  id,
  nonPathologicalHistoryResource,
  bloodTypeResource,
  updateNonPathologicalHistory,
  triggerReload,
}) {
  // Reading the results from the provided resources.
  const nonPathologicalHistoryResult = nonPathologicalHistoryResource.read();
  const bloodTypeResult = bloodTypeResource.read();

  // Extracting data from the fetched results, defaulting to predefined values if not found.
  const {
    smoker = { data: [{ smokes: false, cigarettesPerDay: "", years: "" }] },
    drink = { data: [{ drinks: false, drinksPerMonth: "" }] },
    drugs = { data: [{ usesDrugs: false, drugType: "", frequency: "" }] },
  } = nonPathologicalHistoryResult.result?.medicalHistory || {};

  // State hooks for managing the input values.
  const [smokingStatus, setSmokingStatus] = useState(smoker.data[0].smokes);
  const [cigarettesPerDay, setCigarettesPerDay] = useState(
    smoker.data[0].cigarettesPerDay.toString(),
  );
  const [smokingYears, setSmokingYears] = useState(smoker.data[0].years.toString());
  const [alcoholConsumption, setAlcoholConsumption] = useState(drink.data[0].drinks);
  const [drinksPerMonth, setDrinksPerMonth] = useState(drink.data[0].drinksPerMonth.toString());
  const [drugUse, setDrugUse] = useState(drugs.data[0].usesDrugs);
  const [drugType, setDrugType] = useState(drugs.data[0].drugType);
  const [drugFrequency, setDrugFrequency] = useState(drugs.data[0].frequency.toString());

  // Edit mode state to toggle between view and edit modes.
  const [isEditable, setIsEditable] = useState(false);

  // Error handling based on the response status.
  let errorMessage = "";
  if (nonPathologicalHistoryResult.error) {
    const error = nonPathologicalHistoryResult.error;
    if (error && error.response) {
      const { status } = error.response;
      if (status < 500) {
        errorMessage = "Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
      } else {
        errorMessage = "Ha ocurrido un error interno, lo sentimos.";
      }
    } else {
      errorMessage = "Ha ocurrido un error procesando tu solicitud, por favor vuelve a intentarlo.";
    }
  }

  if (bloodTypeResult.error) {
    const error = bloodTypeResult.error;
    if (error && error.response) {
      const { status } = error.response;
      if (status < 500) {
        errorMessage = "Ha ocurrido un error en la búsqueda del tipo de sangre, ¡Por favor vuelve a intentarlo!";
      } else {
        errorMessage = "Ha ocurrido un error interno, lo sentimos.";
      }
    } else {
      errorMessage =
        "Ha ocurrido un error procesando tu solicitud para obtener el tipo de sangre, por favor vuelve a intentarlo.";
    }
  }

  const nonPathologicalHistoryData = nonPathologicalHistoryResult.result;

  // Memoizing the initial state for resetting or initial rendering.
  const initialState = useMemo(
    () => ({
      smoker: smoker.data[0] || { smokes: false, cigarettesPerDay: "", years: "" },
      drink: drink.data[0] || { drinks: false, drinksPerMonth: "" },
      drugs: drugs.data[0] || { usesDrugs: false, drugType: "", frequency: "" },
    }),
    [nonPathologicalHistoryData],
  );

  const [nonPathologicalHistory, setNonPathologicalHistory] = useState(initialState);

  // Checking if it is the user's first time to display a different UI.
  const isFirstTime = Object.values(nonPathologicalHistory).every(
    (category) => category && Object.keys(category).length === 0,
  );

  // Function to handle cancellation of edits.
  const handleCancel = () => {
    setIsEditable(false);
  };

  // Function to handle saving the changes to the server.
  const handleSaveNonPathological = async () => {
    if (smokingStatus && (cigarettesPerDay === "" || parseInt(cigarettesPerDay) < 1)) {
      toast.error("Por favor, ingrese la cantidad de cigarrillos al día (mayor que cero).");
      return;
    }
    if (smokingStatus && (smokingYears === "" || parseInt(smokingYears) < 1)) {
      toast.error("Por favor, ingrese cuántos años ha fumado.");
      return;
    }
    if (alcoholConsumption && (drinksPerMonth === "" || parseInt(drinksPerMonth) < 1)) {
      toast.error("Por favor, ingrese cuántas bebidas alcohólicas consume al mes (mayor que cero).");
      return;
    }
    if (drugUse && (drugType === "" || drugFrequency === "" || parseInt(drugFrequency) < 1)) {
      toast.error("Por favor, complete los detalles del consumo de drogas (mayor que cero).");
      return;
    }
    const updateDetails = {
      bloodType: bloodTypeResult?.result?.bloodType,
      smoker: {
        version: nonPathologicalHistoryData?.medicalHistory.smoker.version || 1,
        data: [
          {
            smokes: smokingStatus,
            cigarettesPerDay: parseInt(cigarettesPerDay),
            years: parseInt(smokingYears),
          },
        ],
      },
      drink: {
        version: nonPathologicalHistoryData?.medicalHistory.drink.version || 1,
        data: [
          {
            drinks: alcoholConsumption,
            drinksPerMonth: parseInt(drinksPerMonth),
          },
        ],
      },
      drugs: {
        version: nonPathologicalHistoryData?.medicalHistory.drugs.version || 1,
        data: [
          {
            usesDrugs: drugUse,
            drugType: drugType,
            frequency: parseInt(drugFrequency),
          },
        ],
      },
    };

    toast.info("Guardando antecedente quirúrgico...");

    const result = await updateNonPathologicalHistory(id, updateDetails);
    if (!result.error) {
      toast.success("Antecedentes no patológicos actualizados con éxito.");
      setNonPathologicalHistory(updateDetails);
      setIsEditable(false);
      triggerReload();
    } else {
      toast.error("Error al actualizar los antecedentes no patológicos: " + result.error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          border: `1px solid ${colors.primaryBackground}`,
          borderRadius: "10px",
          padding: "1rem",
          height: "65vh",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {errorMessage
          ? (
            <div
              style={{
                color: "red",
                paddingTop: "1rem",
                textAlign: "center",
                fontFamily: fonts.titleFont,
                fontSize: fontSize.textSize,
              }}
            >
              {errorMessage}
            </div>
          )
          : (
            <>
              {isFirstTime && (
                <div
                  style={{
                    paddingTop: "1rem",
                    textAlign: "center",
                    color: colors.titleText,
                    fontWeight: "bold",
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                  }}
                >
                  Por favor ingresa tus datos, parece que es tu primera vez aquí.
                </div>
              )}
              <div
                style={{
                  borderBottom: `0.1rem solid ${colors.darkerGrey}`,
                  padding: "2rem 0 2rem 1rem",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
                  <p
                    style={{
                      marginRight: "1rem",
                      paddingBottom: "0.5rem",
                      fontFamily: fonts.textFont,
                      fontSize: fontSize.textSize,
                    }}
                  >
                    Tipo de sangre:
                  </p>
                  <BaseInput
                    type="text"
                    value={bloodTypeResult?.result?.bloodType ?? ""}
                    readOnly
                    placeholder="Tipo de sangre"
                    style={{
                      width: "20rem",
                      height: "2.5rem",
                      fontFamily: fonts.textFont,
                      fontSize: "1rem",
                    }}
                  />
                </div>
                {!isFirstTime
                  && (isEditable
                    ? (
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <IconButton icon={CheckIcon} onClick={handleSaveNonPathological} />
                        <IconButton
                          icon={CancelIcon}
                          onClick={() => {
                            setIsEditable(false);
                          }}
                        />
                      </div>
                    )
                    : <IconButton icon={EditIcon} onClick={() => setIsEditable(true)} />)}
              </div>
              <div
                style={{
                  paddingLeft: "1rem",
                  borderBottom: `0.1rem solid ${colors.darkerGrey}`,
                }}
              >
                <p
                  style={{
                    paddingBottom: "0.5rem",
                    paddingTop: "2rem",
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                  }}
                >
                  ¿Fuma?
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    paddingBottom: "2rem",
                  }}
                >
                  <RadioInput
                    name="smoking"
                    checked={smokingStatus}
                    onChange={() => setSmokingStatus(true)}
                    label="Sí"
                    disabled={!isEditable}
                  />
                  <RadioInput
                    name="smoking"
                    checked={!smokingStatus}
                    onChange={() => setSmokingStatus(false)}
                    label="No"
                    disabled={!isEditable}
                  />
                </div>
                {smokingStatus && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "1rem", paddingBottom: "2rem" }}>
                      <div>
                        <p
                          style={{
                            paddingBottom: "0.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: fontSize.textSize,
                          }}
                        >
                          ¿Cuántos cigarrillos al día?
                        </p>
                        <BaseInput
                          type="number"
                          value={cigarettesPerDay}
                          onChange={(e) => setCigarettesPerDay(e.target.value)}
                          placeholder="Ingrese cuántos cigarrillos al día"
                          min="1"
                          readOnly={!isEditable}
                          style={{
                            width: "20rem",
                            height: "2.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            paddingBottom: "0.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: fontSize.textSize,
                          }}
                        >
                          ¿Desde hace cuántos años?
                        </p>
                        <BaseInput
                          type="number"
                          value={smokingYears}
                          onChange={(e) => setSmokingYears(e.target.value)}
                          placeholder="Ingrese desde hace cuántos años"
                          min="1"
                          readOnly={!isEditable}
                          style={{
                            width: "20rem",
                            height: "2.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  paddingLeft: "1rem",
                  borderBottom: `0.1rem solid ${colors.darkerGrey}`,
                }}
              >
                <p
                  style={{
                    paddingBottom: "0.5rem",
                    paddingTop: "2rem",
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                  }}
                >
                  ¿Consumes bebidas alcohólicas?
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    paddingBottom: "2rem",
                  }}
                >
                  <RadioInput
                    name="alcoholConsumption"
                    checked={alcoholConsumption}
                    onChange={() => setAlcoholConsumption(true)}
                    label="Sí"
                    disabled={!isEditable}
                  />
                  <RadioInput
                    name="alcoholConsumption"
                    checked={!alcoholConsumption}
                    onChange={() => setAlcoholConsumption(false)}
                    label="No"
                    disabled={!isEditable}
                  />
                </div>
                {alcoholConsumption && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "1rem", paddingBottom: "2rem" }}>
                      <div>
                        <p
                          style={{
                            paddingBottom: "0.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: fontSize.textSize,
                          }}
                        >
                          ¿Cuántas bebidas alcohólicas consumes al mes?
                        </p>
                        <BaseInput
                          type="number"
                          value={drinksPerMonth}
                          onChange={(e) => setDrinksPerMonth(e.target.value)}
                          placeholder="Ingrese cuántas bebidas al mes"
                          min="1"
                          readOnly={!isEditable}
                          style={{
                            width: "20rem",
                            height: "2.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  paddingLeft: "1rem",
                }}
              >
                <p
                  style={{
                    paddingBottom: "0.5rem",
                    paddingTop: "2rem",
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                  }}
                >
                  ¿Consumes alguna droga?
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    paddingBottom: "2rem",
                  }}
                >
                  <RadioInput
                    name="drugUse"
                    checked={drugUse}
                    onChange={() => setDrugUse(true)}
                    label="Sí"
                    disabled={!isEditable}
                  />
                  <RadioInput
                    name="drugUse"
                    checked={!drugUse}
                    onChange={() => setDrugUse(false)}
                    label="No"
                    disabled={!isEditable}
                  />
                </div>
                {drugUse && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "1rem", paddingBottom: "2rem" }}>
                      <div>
                        <p
                          style={{
                            paddingBottom: "0.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: fontSize.textSize,
                          }}
                        >
                          ¿Cuál?
                        </p>
                        <BaseInput
                          type="text"
                          value={drugType}
                          onChange={(e) => setDrugType(e.target.value)}
                          placeholder="Ingrese el tipo de droga"
                          min="1"
                          readOnly={!isEditable}
                          style={{
                            width: "20rem",
                            height: "2.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            paddingBottom: "0.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: fontSize.textSize,
                          }}
                        >
                          ¿Con qué frecuencia?
                        </p>
                        <BaseInput
                          type="number"
                          value={drugFrequency}
                          onChange={(e) => setDrugFrequency(e.target.value)}
                          placeholder="Ingrese la frecuencia del consumo"
                          min="1"
                          readOnly={!isEditable}
                          style={{
                            width: "20rem",
                            height: "2.5rem",
                            fontFamily: fonts.textFont,
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isFirstTime && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "2rem",
                    gap: "1rem",
                  }}
                >
                  <BaseButton
                    text="Guardar"
                    onClick={handleSaveNonPathological}
                    style={{ width: "30%", height: "3rem" }}
                  />
                  <BaseButton
                    text="Cancelar"
                    onClick={handleCancel}
                    style={{
                      width: "30%",
                      height: "3rem",
                      backgroundColor: "#fff",
                      color: colors.primaryBackground,
                      border: `1.5px solid ${colors.primaryBackground}`,
                    }}
                  />
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
