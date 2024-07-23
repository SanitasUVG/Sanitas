import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput, RadioInput } from "src/components/Input/index";
import { colors, fonts, fontSize } from "src/theme.mjs";

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
    toast.error(errorMessage);
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
      const errorMsg = "Por favor, complete todos los campos antes de guardar el registro traumatológico";
      setError(errorMsg);
      toast.error(errorMsg);
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
                      <strong>Hueso:</strong> {trauma.whichBone}
                    </div>
                    <div>
                      <strong>Año:</strong> {trauma.year}
                    </div>
                    <div>
                      <strong>Tratamiento:</strong> {trauma.treatment}
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
              <label
                style={{
                  display: "block",
                  fontFamily: fonts.titleFont,
                  fontSize: fontSize.labelSize,
                  paddingTop: "1rem",
                }}
              >
                Hueso:
              </label>
              <BaseInput
                value={selectedTrauma.whichBone}
                onChange={(e) => handleFieldChange("whichBone", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontFamily: fonts.titleFont,
                  fontSize: fontSize.labelSize,
                  paddingTop: "1rem",
                }}
              >
                Año:
              </label>
              <DropdownMenu
                options={yearOptions}
                selectedValue={selectedTrauma.year}
                onSelect={(value) => handleFieldChange("year", value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontFamily: fonts.titleFont,
                  fontSize: fontSize.labelSize,
                  paddingTop: "1rem",
                }}
              >
                Tratamiento:
              </label>
              <RadioInput
                label="Cirugía"
                checked={selectedTrauma.treatment === "Cirugía"}
                onChange={() => handleFieldChange("treatment", "Cirugía")}
                name="treatment"
              />
              <RadioInput
                label="Conservador"
                checked={selectedTrauma.treatment === "Conservador"}
                onChange={() => handleFieldChange("treatment", "Conservador")}
                name="treatment"
              />

              {error && (
                <div
                  style={{
                    color: "red",
                    paddingTop: "1rem",
                    fontFamily: fonts.titleFont,
                    fontSize: fontSize.textSize,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginTop: "2rem" }}>
                <BaseButton
                  text="Guardar"
                  onClick={handleSaveNewTrauma}
                  style={{ width: "100%", height: "3rem" }}
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
                    marginTop: "0.5rem",
                  }}
                />
              </div>
            </div>
          </div>
        )
        : null}
    </div>
  );
}

export default TraumatologicView;
