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
 * @typedef {Object} SurgicalHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getSurgicalHistory - Function to fetch the surgical history of a patient.
 * @property {Function} updateSurgicalHistory - Function to update or add new surgical records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's surgical history, allowing users to add and view records.
 *
 * @param {SurgicalHistoryProps} props - The props passed to the SurgicalHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function AlergicHistory({
  getBirthdayPatientInfo,
  getSurgicalHistory,
  updateSurgicalHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
  // const surgicalHistoryResource = WrapPromise(getSurgicalHistory(id));

  const LoadingView = () => {
    return <Throbber loadingMessage="Cargando información de los antecedentes alérgicos..." />;
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
              Antecedentes Alérgicos
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
              Registro de antecedentes Alérgicos
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
              <AllergicView
                id={id}
                birthdayResource={birthdayResource}
                //  surgicalHistoryResource={surgicalHistoryResource}
                //  updateSurgicalHistory={updateSurgicalHistory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @typedef {Object} AllergicViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} surgicalHistoryResource - Wrapped resource for fetching surgical history data.
 * @property {Function} updateSurgicalHistory - Function to update the surgical history.
 *
 * Internal view component for managing the display and modification of a patient's surgical history, with options to add or edit records.
 *
 * @param {AllergicViewProps} props - Specific props for the AllergicViewiew component.
 * @returns {JSX.Element} - A detailed view for managing surgical history with interactivity to add or edit records.
 */
function AllergicView({ id, birthdayResource, surgicalHistoryResource, updateSurgicalHistory }) {
  const [selectedAllergie, setSelectedAllergie] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [yearOptions, setYearOptions] = useState([]);

  const birthYearResult = birthdayResource.read();
  // const surgicalHistoryResult = surgicalHistoryResource.read();

  let errorMessage = "";
  /*
    if (birthYearResult.error || surgicalHistoryResult.error) {
        const error = birthYearResult.error || surgicalHistoryResult.error;
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
        */

  const birthYearData = birthYearResult.result;
  // const surgicalHistoryData = surgicalHistoryResult.result;

  // let sortedData = surgicalHistoryData?.medicalHistory.surgeries.data || [];
  // sortedData.sort((a, b) => Number.parseInt(b.surgeryYear) - Number.parseInt(a.surgeryYear));

  const [AllergicHistory, setAllergicHistory] = useState({
    // data: sortedData,
    // version: surgicalHistoryData?.medicalHistory.surgeries.version || 1,
  });

  // No surgical data in API
  const noSurgeryData = false;
  // surgicalHistory.data.length === 0;
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

  // Event handlers for adding, editing, and saving surgical history records
  const handleOpenNewForm = () => {
    setSelectedAllergie({ selectedMed: "", surgeryYear: currentYear.toString(), complications: "" });
    setAddingNew(true);
  };

  // Save the new surgery record to the database
  const handleSaveNewAllergie = async () => {
    if (
      !selectedSurgery.whichMed
      || !selectedSurgery.surgeryYear
      || selectedSurgery.complications === undefined
    ) {
      toast.error("Complete todos los campos requeridos.");
      return;
    }

    toast.info("Guardando antecedente alérgicos...");

    const updatedSurgicalHistory = {
      data: [...surgicalHistory.data, selectedSurgery],
      version: surgicalHistory.version,
    };

    updatedSurgicalHistory.data.sort((a, b) => b.surgeryYear - a.surgeryYear);

    try {
      const response = await updateSurgicalHistory(
        id,
        updatedSurgicalHistory.data,
        surgicalHistory.version,
      );
      if (!response.error) {
        setSurgicalHistory(updatedSurgicalHistory);
        setAddingNew(false);
        setSelectedSurgery(null);
        toast.success("Antecedente alérgico guardado con éxito.");
      } else {
        toast.error(`Error al guardar: ${response.error}`);
      }
    } catch (error) {
      toast.error(`Error en la operación: ${error.message}`);
    }
  };
  const handleSelectAllergie = (e) => {
    const disease = e.target.value;
    setSelectedFamiliar({ ...selectedFamiliar, disease: disease });
    console.log("Enfermedad seleccionada:", disease); // Para depuración
  };

  // Select a surgery record to view
  const handleSelectSurgery = (surgery) => {
    setSelectedSurgery({
      surgeryType: surgery.surgeryType,
      surgeryYear: surgery.surgeryYear,
      complications: surgery.complications,
    });
    setAddingNew(false);
  };

  const handleFieldChange = (fieldName, value) => {
    // setSelectedTrauma((prevTrauma) => ({ ...prevTrauma, [fieldName]: value }));
  };

  const handleCancel = () => {
    setSelectedSurgery(null);
    setAddingNew(false);
  };

  const diseaseOptions = [
    { label: "Hipertensión arterial", value: "hipertension_arterial" },
    { label: "Diabetes Mellitus", value: "diabetes_mellitus" },
    { label: "Hipotiroidismo", value: "hipotiroidismo" },
    { label: "Asma", value: "asma" },
    { label: "Convulsiones", value: "convulsiones" },
    { label: "Infarto Agudo de Miocardio", value: "infarto_agudo_miocardio" },
    { label: "Cáncer", value: "cancer" },
    { label: "Enfermedades cardiacas", value: "enfermedades_cardiacas" },
    { label: "Enfermedades renales", value: "enfermedades_renales" },
    { label: "Otros", value: "otros" },
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
        <div
          style={{
            paddingBottom: "0.5rem",
          }}
        >
          <BaseButton
            text="Agregar antecedente Alérgico"
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

        {noSurgeryData && !errorMessage
          ? (
            <p style={{ textAlign: "center", paddingTop: "20px" }}>
              ¡Parece que no hay antecedentes alérgicos! Agrega uno en el botón de arriba.
            </p>
          )
          : (
            /*surgicalHistory.data.map((surgery, index) => (
                            <InformationCard
                                key={index}
                                type="surgical"
                                year={surgery.surgeryYear}
                                surgeryType={surgery.surgeryType}
                                onClick={() => handleSelectSurgery(surgery)}
                            />
                        ))*/

            <div></div>
          )}
      </div>

      {addingNew || selectedAllergie
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
            <p
              style={{
                paddingBottom: "0.5rem",
                paddingTop: "1.5rem",
                fontFamily: fonts.textFont,
                fontSize: fontSize.textSize,
              }}
            >
              ¿Es alérgico a uno de los siguientes?
            </p>
            <DropdownMenu
              options={diseaseOptions}
              value={""}
              readOnly={!addingNew}
              onChange={handleSelectAllergie}
              style={{
                container: { width: "80%" },
                select: {},
                option: {},
                indicator: {},
              }}
            />

            <p
              style={{
                paddingBottom: "0.5rem",
                paddingTop: "2rem",
                fontFamily: fonts.textFont,
                fontSize: fontSize.textSize,
              }}
            >
              ¿A cual?
            </p>
            <BaseInput
              value={""}
              onChange={(e) => handleFieldChange("whichMed", e.target.value)}
              placeholder="Ingrese a cuál del tipo seleccionado"
              style={{
                width: "90%",
                height: "2.5rem",
                fontFamily: fonts.textFont,
                fontSize: "1rem",
              }}
            />

            <p
              style={{
                paddingBottom: "0.5rem",
                paddingTop: "2rem",
                fontFamily: fonts.textFont,
                fontSize: fontSize.textSize,
              }}
            >
              Tipo de reacción
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                paddingLeft: "1.5rem",
              }}
            >
              <RadioInput
                label="Cutánea"
                name="treatment"
                checked={""}
                onChange={() => handleFieldChange("treatment", "Cirugía")}
                style={{ label: { fontFamily: fonts.textFont } }}
              />
              <RadioInput
                label="Respiratoria"
                name="treatment"
                checked={""}
                onChange={() => handleFieldChange("treatment", "Conservador")}
                style={{ label: { fontFamily: fonts.textFont } }}
              />
              <RadioInput
                label="Ambos"
                name="treatment"
                checked={""}
                onChange={() => handleFieldChange("treatment", "Conservador")}
                style={{ label: { fontFamily: fonts.textFont } }}
              />
            </div>

            <div
              style={{
                paddingTop: "5rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {addingNew && (
                <>
                  <BaseButton
                    text="Guardar"
                    onClick={handleSaveNewAllergie}
                    style={{ width: "30%", height: "3rem" }}
                  />
                  <div style={{ width: "1rem" }}></div>
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
                </>
              )}
            </div>
          </div>
        )
        : null}
    </div>
  );
}
