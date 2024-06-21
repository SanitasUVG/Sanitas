import React, { useEffect, useState } from "react";
import AppointmentSurgeryCard from "src/components/AppointmentSurgeryCard";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput } from "src/components/Input/index";
import { colors, fonts, fontSize } from "src/theme.mjs";

/**
 * @typedef {Object} SurgicalHistory
 * @property {import("src/dataLayer.mjs").getSurgicalHistory} getSurgicalHistory
 * @property {import("src/dataLayer.mjs").updateSurgicalHistory} updateSurgicalHistory
 * @property {import("src/components/DashboardSidebar").DashboardSidebarProps} sidebarConfig - The config for the view sidebar
 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {SurgicalHistory} props
 */

export function SurgicalHistory({
  getBirthdayPatientInfo,
  getSurgicalHistory,
  updateSurgicalHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const [surgicalHistory, setSurgicalHistory] = useState([]);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [birthYear, setBirthYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchBirthday = async () => {
      const result = await getBirthdayPatientInfo(id);
      if (!result.error && result.result && result.result.birthdate) {
        const birthday = new Date(result.result.birthdate);
        setBirthYear(birthday.getFullYear());
      } else {
        error(result.error || "Error fetching birthday information");
      }
    };

    if (id) {
      fetchBirthday();
    }
  }, [id, getBirthdayPatientInfo]);

  const currentYear = new Date().getFullYear();
  const yearOptions = [];

  for (let year = birthYear; year <= currentYear; year++) {
    yearOptions.push({ value: year, label: year.toString() });
  }

  useEffect(() => {
    const fetchSurgicalHistory = async () => {
      const result = await getSurgicalHistory(id);
      if (!result.error && result.result && result.result.surgicalEventData) {
        setSurgicalHistory(result.result.surgicalEventData);
      } else if (!result.error) {
        setSurgicalHistory([]);
      } else {
        error(result.error);
      }
    };

    if (id) {
      fetchSurgicalHistory();
    }
  }, [id, getSurgicalHistory]);

  const handleOpenNewForm = () => {
    setSelectedSurgery({ type: "", year: currentYear, complications: "" });
    setAddingNew(true);
  };

  const handleSaveNewSurgery = async () => {
    if (
      !selectedSurgery.type
      || !selectedSurgery.year
      || selectedSurgery.complications === undefined
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const updatedSurgicalHistory = [...surgicalHistory, selectedSurgery];

    const response = await updateSurgicalHistory(id, updatedSurgicalHistory);

    if (!response.error) {
      setSurgicalHistory(updatedSurgicalHistory);
      setAddingNew(false);
      setSelectedSurgery(null);
    } else {
      error(response.error);
      alert("Error saving the surgical history: " + response.error);
    }
  };

  const handleSelectSurgery = (surgery) => {
    setSelectedSurgery({
      type: surgery.surgeryType,
      year: surgery.surgeryYear,
      complications: surgery.complications,
    });
    setAddingNew(false);
  };

  const handleCancel = () => {
    setSelectedSurgery(null);
    setAddingNew(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: colors.primaryBackground,
        height: "100vh",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "30%",
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
              Antecedentes Quirúrjicos
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
              Registro de antecedentes quirúrjicos
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
                  text="Agregar antecedente quirúrgico"
                  onClick={handleOpenNewForm}
                  style={{ width: "100%", height: "3rem" }}
                />
              </div>

              {surgicalHistory.length > 0
                ? (
                  surgicalHistory.map((surgery, index) => (
                    <AppointmentSurgeryCard
                      key={index}
                      type="surgical"
                      year={surgery.surgeryYear}
                      surgeryType={surgery.surgeryType}
                      onClick={() => handleSelectSurgery(surgery)}
                    />
                  ))
                )
                : (
                  <p style={{ textAlign: "center", paddingTop: "20px" }}>
                    No se ha encontrado antecedentes quirúrgicos para el paciente.
                  </p>
                )}
            </div>

            {addingNew || selectedSurgery
              ? (
                <div
                  style={{
                    border: `1px solid ${colors.primaryBackground}`,
                    borderRadius: "10px",
                    padding: "1rem",
                    height: "65vh",
                    flex: 1.8,
                    overflowY: "auto",
                    width: "100%",
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
                    ¿De qué?
                  </p>
                  <BaseInput
                    value={selectedSurgery.type}
                    onChange={(e) => setSelectedSurgery({ ...selectedSurgery, type: e.target.value })}
                    placeholder="Ingrese acá el motivo o tipo de cirugía"
                    style={{
                      width: "95%",
                      height: "10%",
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
                    ¿En qué año?
                  </p>
                  <DropdownMenu
                    options={yearOptions}
                    value={selectedSurgery.year}
                    onChange={(e) =>
                      setSelectedSurgery({
                        ...selectedSurgery,
                        year: Number.parseInt(e.target.value),
                      })}
                  />

                  <p
                    style={{
                      paddingBottom: "0.5rem",
                      paddingTop: "2rem",
                      fontFamily: fonts.textFont,
                      fontSize: fontSize.textSize,
                    }}
                  >
                    ¿Tuvo alguna complicación?
                  </p>
                  <BaseInput
                    value={selectedSurgery.complications || ""}
                    onChange={(e) => setSelectedSurgery({ ...selectedSurgery, complications: e.target.value })}
                    placeholder="Ingrese complicaciones que pudo haber tenido durante o después de la cirugía."
                    style={{
                      width: "95%",
                      height: "15%",
                      fontFamily: fonts.textFont,
                      fontSize: "1rem",
                    }}
                  />

                  <div
                    style={{
                      paddingTop: "5rem",
                      display: "flex",
                      justifyContent: "center",
                      gap: "2rem",
                    }}
                  >
                    {addingNew && (
                      <>
                        <BaseButton
                          text="Guardar"
                          onClick={handleSaveNewSurgery}
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
                      </>
                    )}
                  </div>
                </div>
              )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
