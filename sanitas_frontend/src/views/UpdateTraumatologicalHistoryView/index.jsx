import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} TraumatologicHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getTraumatologicHistory - Function to fetch the traumatologic history of a patient.
 * @property {Function} updateTraumatologicHistory - Function to update or add new traumatologic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's traumatologic history, allowing users to add and view records.
 *
 * @param {TraumatologicHistoryProps} props - The props passed to the TraumatologicHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function TraumatologicHistory({
  getBirthdayPatientInfo,
  getTraumatologicHistory,
  updateTraumatologicHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
  const traumatologicHistoryResource = WrapPromise(getTraumatologicHistory(id));

  const LoadingView = () => <Throbber loadingMessage="Cargando información de los antecedentes traumatológicos..." />;

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
      <div style={{ width: "25%" }}>
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
              Antecedentes Traumatológicos
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
              Registro de antecedentes traumatológicos
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "space-between",
              width: "100%",
              gap: "2rem",
            }}
          >
            <Suspense fallback={<LoadingView />}>
              <TraumatologicView
                id={id}
                birthdayResource={birthdayResource}
                traumatologicHistoryResource={traumatologicHistoryResource}
                updateTraumatologicHistory={updateTraumatologicHistory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @typedef {Object} TraumatologicViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} traumatologicHistoryResource - Wrapped resource for fetching traumatologic history data.
 * @property {Function} updateTraumatologicHistory - Function to update the traumatologic history.
 *
 * Internal view component for managing the display and modification of a patient's traumatologic history, with options to add or edit records.
 *
 * @param {TraumatologicViewProps} props - Specific props for the TraumatologicView component.
 * @returns {JSX.Element} - A detailed view for managing traumatologic history with interactivity to add or edit records.
 */
function TraumatologicView({ id, birthdayResource, traumatologicHistoryResource, updateTraumatologicHistory }) {
  const [selectedTrauma, setSelectedTrauma] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState("");
  const [yearOptions, setYearOptions] = useState([]);

  const birthYearResult = birthdayResource.read();
  const traumatologicHistoryResult = traumatologicHistoryResource.read();

  let errorMessage = "";
  if (birthYearResult.error || traumatologicHistoryResult.error) {
    const error = birthYearResult.error || traumatologicHistoryResult.error;
    if (error && error.response) {
      const { status } = error.response;
      errorMessage = status < 500
        ? "Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!"
        : "Ha ocurrido un error interno, lo sentimos.";
    } else {
      errorMessage = "Ha ocurrido un error procesando tu solicitud, por favor vuelve a intentarlo.";
    }
  }

  const birthYearData = birthYearResult.result;
  const traumatologicHistoryData = traumatologicHistoryResult.result;

  let sortedData = traumatologicHistoryData?.medicalHistory.traumas.data || [];
  sortedData.sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year));

  const [traumatologicHistory, setTraumatologicHistory] = useState({
    data: sortedData,
    version: traumatologicHistoryData?.medicalHistory.traumas.version || 1,
  });

  const noTraumaData = traumatologicHistory.data.length === 0;
  const currentYear = new Date().getFullYear();

  const birthYear = birthYearData?.birthdate
    ? new Date(birthYearData.birthdate).getFullYear()
    : null;

  useEffect(() => {
    const options = [];
    if (birthYear) {
      for (let year = birthYear; year <= currentYear; year++) {
        options.push({ value: year, label: year.toString() });
      }
    }
    setYearOptions(options);
  }, [birthYear]);

  const handleOpenNewForm = () => {
    setSelectedTrauma({ whichBone: "", year: currentYear.toString(), treatment: "" });
    setAddingNew(true);
    setError("");
  };

  const handleSaveNewTrauma = async () => {
    if (!selectedTrauma.whichBone || !selectedTrauma.year || selectedTrauma.treatment === undefined) {
      setError("Por favor, complete todos los campos antes de guardar el registro traumatológico");
      toast.error("Complete todos los campos requeridos.");
      return;
    }

    toast.info("Guardando antecedente traumatológico...");

    const updatedTraumatologicHistory = {
      data: [...traumatologicHistory.data, selectedTrauma],
      version: traumatologicHistory.version,
    };

    updatedTraumatologicHistory.data.sort((a, b) => b.year - a.year);

    try {
      const response = await updateTraumatologicHistory(
        id,
        updatedTraumatologicHistory.data,
        traumatologicHistory.version,
      );
      if (!response.error) {
        setTraumatologicHistory(updatedTraumatologicHistory);
        setAddingNew(false);
        setSelectedTrauma(null);
        toast.success("Se ha guardado el registro traumatológico exitosamente.");
      } else {
        toast.error(`Error al guardar: ${response.error}`);
        setError(response.error.message);
      }
    } catch (error) {
      setError(error.message);
      toast.error("Hubo un error interno al guardar el registro traumatológico.");
    }
  };

  const handleUpdateExistingTrauma = (index) => {
    const trauma = traumatologicHistory.data[index];
    setSelectedTrauma({ ...trauma });
    setAddingNew(true);
  };

  const handleFieldChange = (fieldName, value) => {
    setSelectedTrauma((prevTrauma) => ({ ...prevTrauma, [fieldName]: value }));
  };

  const handleDeleteTrauma = (index) => {
    const updatedTraumas = [...traumatologicHistory.data];
    updatedTraumas.splice(index, 1);

    const updatedTraumatologicHistory = {
      data: updatedTraumas,
      version: traumatologicHistory.version,
    };

    try {
      updateTraumatologicHistory(id, updatedTraumas, traumatologicHistory.version);
      setTraumatologicHistory(updatedTraumatologicHistory);
      toast.success("Se ha eliminado el antecedente traumatológico exitosamente.");
    } catch (error) {
      setError(error.message);
      toast.error("Hubo un error al eliminar el registro traumatológico.");
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
        <div
          style={{
            paddingBottom: "0.5rem",
          }}
        >
          <BaseButton
            text="Agregar antecedente traumatológico"
            onClick={handleOpenNewForm}
            style={{ width: "100%", height: "3rem" }}
          />
        </div>

        {errorMessage && (
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
        )}

        {noTraumaData && !errorMessage
          ? (
            <p style={{ textAlign: "center", paddingTop: "20px" }}>
              ¡Parece que no hay antecedentes traumatológicos! Agrega uno en el botón de arriba.
            </p>
          )
          : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {traumatologicHistory.data.map((trauma, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    backgroundColor: index % 2 === 0 ? colors.cardBackground : colors.alternateCardBackground,
                    borderRadius: "5px",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div>
                      <strong>Hueso fracturado:</strong> {trauma.whichBone}
                    </div>
                    <div>
                      <strong>Año de fractura:</strong> {trauma.year}
                    </div>
                    <div>
                      <strong>Tratamiento recibido:</strong> {trauma.treatment}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <BaseButton
                      onClick={() => handleUpdateExistingTrauma(index)}
                      text="Editar"
                      style={{
                        width: "80px",
                        height: "3rem",
                        backgroundColor: colors.secondaryBackground,
                        color: "#fff",
                      }}
                    />
                    <BaseButton
                      onClick={() => handleDeleteTrauma(index)}
                      text="Eliminar"
                      style={{ width: "80px", height: "3rem", backgroundColor: colors.dangerBackground, color: "#fff" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {addingNew || selectedTrauma
        ? (
          <div
            style={{
              border: `1px solid ${colors.primaryBackground}`,
              borderRadius: "10px",
              padding: "1rem",
              height: "65vh",
              flex: 1.5,
              overflowY: "auto",
              width: "100%",
              paddingLeft: "2rem",
            }}
          >
            <h2>{selectedTrauma ? "Editar Antecedente Traumatológico" : "Nuevo Antecedente Traumatológico"}</h2>

            <div>
              <p
                style={{
                  paddingBottom: "0.5rem",
                  paddingTop: "2rem",
                  fontFamily: fonts.textFont,
                  fontSize: fontSize.textSize,
                }}
              >
                ¿Cuál?
              </p>
              <BaseInput
                value={selectedTrauma?.whichBone || ""}
                onChange={(e) => handleFieldChange("whichBone", e.target.value)}
                readOnly={!addingNew}
                placeholder="Ingrese el hueso fracturado"
                style={{ width: "95%", height: "10%", fontFamily: fonts.textFont, fontSize: "1rem" }}
              />

              <p
                style={{
                  paddingBottom: "0.5rem",
                  paddingTop: "2rem",
                  fontFamily: fonts.textFont,
                  fontSize: fontSize.textSize,
                }}
              >
                ¿En qué año?
              </p>
              <DropdownMenu
                options={yearOptions}
                value={selectedTrauma?.year || ""}
                readOnly={!addingNew}
                onChange={(e) => handleFieldChange("year", e.target.value)}
                style={{ width: "95%", height: "10%", fontFamily: fonts.textFont, fontSize: "1rem" }}
              />

              <p
                style={{
                  paddingBottom: "0.5rem",
                  paddingTop: "2rem",
                  fontFamily: fonts.textFont,
                  fontSize: fontSize.textSize,
                }}
              >
                ¿Qué tratamiento tuvo?
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "left",
                  alignItems: "left",
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                }}
              >
                <div style={{ paddingRight: "1.25rem" }}>
                  <RadioInput
                    name="treatment"
                    checked={selectedTrauma?.treatment === "Cirugía"}
                    onChange={() => handleFieldChange("treatment", "Cirugía")}
                    label="Cirugía"
                    style={{ fontFamily: fonts.textFont }}
                  />
                </div>
                <div>
                  <RadioInput
                    name="treatment"
                    checked={selectedTrauma?.treatment === "Conservador"}
                    onChange={() => handleFieldChange("treatment", "Conservador")}
                    label="Conservador (yeso, canal, inmovilizador)"
                  />
                </div>
              </div>
            </div>
            <BaseButton
              text="Guardar"
              onClick={handleSaveNewTrauma}
              style={{ width: "100%", height: "3rem", backgroundColor: colors.primaryBackground, color: "#fff" }}
            />
            <BaseButton
              text="Cancelar"
              onClick={() => {
                setAddingNew(false);
                setSelectedTrauma(null);
                setError("");
              }}
              style={{
                width: "100%",
                height: "3rem",
                backgroundColor: colors.secondaryBackground,
                color: "#fff",
                marginTop: "1rem",
              }}
            />
          </div>
        )
        : null}
    </div>
  );
}

export default TraumatologicView;
