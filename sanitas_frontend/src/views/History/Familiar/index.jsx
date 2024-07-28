import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import { BaseInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

export function FamiliarHistory({
  getFamiliarlHistory,
  updateFamiliarHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const familiarHistoryResource = WrapPromise(getFamiliarlHistory(id));

  const LoadingView = () => {
    return <Throbber loadingMessage="Cargando información de los antecedentes familiares..." />;
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
              Antecedentes Familiares
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
              Registro de antecedentes familiares
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
              <FamiliarView
                id={id}
                familiarHistoryResource={familiarHistoryResource}
                updateFamiliarHistory={updateFamiliarHistory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamiliarView({ id, familiarHistoryResource, updateFamiliarHistory }) {
  const [selectedFamiliar, setSelectedFamiliar] = useState({});
  const [addingNew, setAddingNew] = useState(false);

  const familiarHistoryResult = familiarHistoryResource.read();
  let errorMessage = "";
  if (familiarHistoryResult.error) {
    const error = familiarHistoryResult.error;
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

  const familiarHistoryData = familiarHistoryResult.result;

  const [familiarHistory, setFamiliarHistory] = useState({
    hypertension: {
      data: familiarHistoryData?.medicalHistory.hypertension.data || [],
      version: familiarHistoryData?.medicalHistory.hypertension.version || 1,
    },
    diabetesMellitus: {
      data: familiarHistoryData?.medicalHistory.diabetesMellitus.data || [],
      version: familiarHistoryData?.medicalHistory.diabetesMellitus.version || 1,
    },
    hypothyroidism: {
      data: familiarHistoryData?.medicalHistory.hypothyroidism.data || [],
      version: familiarHistoryData?.medicalHistory.hypothyroidism.version || 1,
    },
    asthma: {
      data: familiarHistoryData?.medicalHistory.asthma.data || [],
      version: familiarHistoryData?.medicalHistory.asthma.version || 1,
    },
    convulsions: {
      data: familiarHistoryData?.medicalHistory.convulsions.data || [],
      version: familiarHistoryData?.medicalHistory.convulsions.version || 1,
    },
    myocardialInfarction: {
      data: familiarHistoryData?.medicalHistory.myocardialInfarction.data || [],
      version: familiarHistoryData?.medicalHistory.myocardialInfarction.version || 1,
    },
    cancer: {
      data: familiarHistoryData?.medicalHistory.cancer.data || [],
      version: familiarHistoryData?.medicalHistory.cancer.version || 1,
    },
    cardiacDiseases: {
      data: familiarHistoryData?.medicalHistory.cardiacDiseases.data || [],
      version: familiarHistoryData?.medicalHistory.cardiacDiseases.version || 1,
    },
    renalDiseases: {
      data: familiarHistoryData?.medicalHistory.renalDiseases.data || [],
      version: familiarHistoryData?.medicalHistory.renalDiseases.version || 1,
    },
    others: {
      data: familiarHistoryData?.medicalHistory.others.data || [],
      version: familiarHistoryData?.medicalHistory.others.version || 1,
    },
  });

  // No familiar data in API
  const noFamiliarData = Object.keys(familiarHistory).every(
    (key) => familiarHistory[key] && familiarHistory[key].data && familiarHistory[key].data.length === 0,
  );

  // Open new form to add a new disease
  const handleOpenNewForm = () => {
    setSelectedFamiliar({ disease: "hipertension_arterial" });
    setAddingNew(true);
  };

  const handleSelectDisease = (e) => {
    const disease = e.target.value;
    setSelectedFamiliar({ ...selectedFamiliar, disease: disease });
    console.log("Enfermedad seleccionada:", disease); // Para depuración
  };

  const handleCancel = () => {
    setSelectedFamiliar({});
    setAddingNew(false);
  };

  const handleSaveNewFamiliar = async () => {
    console.log("Intentando guardar para la enfermedad:", selectedFamiliar.disease);

    if (!selectedFamiliar.disease || !familiarHistory[selectedFamiliar.disease]) {
      toast.error("Por favor, selecciona una enfermedad válida.");
      return;
    }

    console.log("Estado actual antes de guardar:", familiarHistory[selectedFamiliar.disease]);

    if (
      !selectedFamiliar.relative
      || (["cancer", "others", "cardiacDiseases", "renalDiseases"].includes(

        selectedFamiliar.disease,
      )
        && !selectedFamiliar.typeOfDisease)
    ) {
      toast.error("Por favor, completa todos los campos necesarios.");
      return;
    }

    const newEntry = {
      who: selectedFamiliar.relative,
      typeOfDisease: selectedFamiliar.typeOfDisease || undefined,
    };

    if (
      ["cancer", "cardiacDiseases", "renalDiseases", "others"].includes(selectedFamiliar.disease)
    ) {
      newEntry.typeOfDisease = selectedFamiliar.typeOfDisease || "";
    }

    const updatedData = [...familiarHistory[selectedFamiliar.disease].data, newEntry];
    const updatedHistory = {
      data: updatedData,
      version: familiarHistory[selectedFamiliar.disease].version,

    };

    // Preparar el estado actualizado completo
    const updatedFamilyHistoryDetails = {
      ...familiarHistory,
      [selectedFamiliar.disease]: updatedHistory,
    };

    // Mostrar información para depuración
    console.log(
      "Datos actualizados a guardar:",
      updatedFamilyHistoryDetails[selectedFamiliar.disease],
    );

    // Guardar la información actualizada
    toast.info("Guardando antecedente familiar...", {
      autoClose: false,
      toastId: "savingFamilyHistory",
    });

    const response = await updateFamiliarHistory(id, {
      medicalHistory: updatedFamilyHistoryDetails,
    });
    if (response.error) {
      toast.error(`Error al guardar la información: ${response.error}`);
    } else {
      toast.success("Historial familiar guardado con éxito.");

      setFamiliarHistory(updatedFamilyHistoryDetails);
      setSelectedFamiliar({});
      setAddingNew(false);
    }
  };

  const diseaseOptions = [
    { label: "Hipertensión arterial", value: "hypertension" },
    { label: "Diabetes Mellitus", value: "diabetesMellitus" },
    { label: "Hipotiroidismo", value: "hypothyroidism" },
    { label: "Asma", value: "asthma" },
    { label: "Convulsiones", value: "convulsions" },
    { label: "Infarto Agudo de Miocardio", value: "myocardialInfarction" },
    { label: "Cáncer", value: "cancer" },
    { label: "Enfermedades cardiacas", value: "cardiacDiseases" },
    { label: "Enfermedades renales", value: "renalDiseases" },
    { label: "Otros", value: "others" },

  ];

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
        <div style={{ paddingBottom: "0.5rem" }}>
          <BaseButton
            text="Agregar antecedente familiar"
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

        {noFamiliarData && !errorMessage
          ? (
            <p style={{ textAlign: "center", paddingTop: "20px" }}>
              ¡Parece que no hay antecedentes familiares! Agrega uno en el botón de arriba.
            </p>
          )
          : (
            Object.entries(familiarHistoryData).map(([diseaseKey, { data = [], version }]) =>
              data.length > 0
                ? data.map((entry, index) => (
                  <InformationCard
                    key={`${diseaseKey}-${index}`}
                    type="family"
                    disease={diseaseKey.replace(/_/g, " ")}
                    familiar={entry.who}
                    onClick={() => handleSelectDisease(diseaseKey, entry)}
                  />
                ))
                : null
            )
          )}
      </div>

      {addingNew || selectedFamiliar.disease
        ? (
          <div
            style={{
              border: `0.063rem solid ${colors.primaryBackground}`,
              borderRadius: "0.625rem",
              padding: "1rem",
              height: "65vh",
              flex: 1.5,
              width: "100%",
              paddingLeft: "2rem",
              flexGrow: 1,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <p
                style={{
                  paddingBottom: "0.5rem",
                  paddingTop: "1.5rem",
                  fontFamily: fonts.textFont,
                  fontSize: fontSize.textSize,
                  fontWeight: "bold",
                }}
              >
                Seleccione la enfermedad:
              </p>
              <DropdownMenu
                options={diseaseOptions}
                value={selectedFamiliar.disease || ""}
                readOnly={!addingNew}
                onChange={handleSelectDisease}
                style={{
                  container: { width: "80%" },
                  select: {},
                  option: {},
                  indicator: {},
                }}
              />
            </div>

            {selectedFamiliar.disease && (
              <>
                {selectedFamiliar.disease !== "others" && (
                  <>
                    <p
                      style={{
                        fontFamily: fonts.textFont,
                        fontSize: fontSize.textSize,
                        paddingTop: "1.5rem",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      ¿Quién padece de {selectedFamiliar.disease.replace(/_/g, " ")}?
                    </p>
                    <BaseInput
                      value={selectedFamiliar.relative || ""}
                      onChange={(e) => setSelectedFamiliar({ ...selectedFamiliar, relative: e.target.value })}
                      placeholder="Ingrese quién de los familiares padeció de la enfermedad."
                      style={{ width: "90%", height: "2.5rem" }}
                    />
                  </>
                )}
                {["cancer", "others", "cardiacDiseases", "renalDiseases"].includes(

                  selectedFamiliar.disease,
                ) && (
                  <>
                    <p
                      style={{
                        fontFamily: fonts.textFont,
                        fontSize: fontSize.textSize,
                        paddingTop: "1.5rem",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {selectedFamiliar.disease === "cancer"
                        ? "Tipo de cáncer:"
                        : selectedFamiliar.disease === "otros"
                        ? "¿Qué enfermedad?"
                        : "Tipo de enfermedad:"}
                    </p>
                    <BaseInput
                      value={selectedFamiliar.typeOfDisease || ""}
                      onChange={(e) => setSelectedFamiliar({ ...selectedFamiliar, typeOfDisease: e.target.value })}
                      placeholder={selectedFamiliar.disease === "cancer"
                        ? "Especifique el tipo de cáncer"
                        : selectedFamiliar.disease === "otros"
                        ? "Describa la enfermedad"
                        : "Especifique el tipo"}
                      style={{ width: "90%", height: "2.5rem" }}
                    />
                  </>
                )}

                {selectedFamiliar.disease === "others" && (
                  <>
                    <p
                      style={{
                        fontFamily: fonts.textFont,
                        fontSize: fontSize.textSize,
                        paddingTop: "1.5rem",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      ¿Quién?
                    </p>
                    <BaseInput
                      value={selectedFamiliar.relative || ""}
                      onChange={(e) => setSelectedFamiliar({ ...selectedFamiliar, relative: e.target.value })}
                      placeholder="Ingrese quién de los familiares padeció de la enfermedad"
                      style={{ width: "90%", height: "2.5rem" }}
                    />
                  </>
                )}

                {addingNew && (
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
                      onClick={handleSaveNewFamiliar}
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
        )
        : null}
    </div>
  );
}
