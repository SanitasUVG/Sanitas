import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

export function NonPathologicalHistory({
  getNonPathologicalHistory,
  updateNonPathologicalHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const nonPathologicalHistoryResource = WrapPromise(getNonPathologicalHistory(id));

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
                updateNonPathologicalHistory={updateNonPathologicalHistory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function NonPathologicalView({ id, nonPathologicalHistoryResource, updateNonPathologicalHistory }) {
  const [smokingStatus, setSmokingStatus] = useState(false);
  const [cigarettesPerDay, setCigarettesPerDay] = useState("");
  const [smokingYears, setSmokingYears] = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState(false);
  const [drinksPerMonth, setDrinksPerMonth] = useState("");
  const [drugUse, setDrugUse] = useState(false);
  const [drugType, setDrugType] = useState("");
  const [drugFrequency, setDrugFrequency] = useState("");

  const nonPathologicalHistoryResult = nonPathologicalHistoryResource.read();
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

  const handleSaveNonPathological = async () => {};
  const handleCancel = () => {};

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
                  />
                  <RadioInput
                    name="smoking"
                    checked={!smokingStatus}
                    onChange={() => setSmokingStatus(false)}
                    label="No"
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
                  />
                  <RadioInput
                    name="alcoholConsumption"
                    checked={!alcoholConsumption}
                    onChange={() => setAlcoholConsumption(false)}
                    label="No"
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
                  />
                  <RadioInput
                    name="drugUse"
                    checked={!drugUse}
                    onChange={() => setDrugUse(false)}
                    label="No"
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
            </>
          )}
      </div>
    </div>
  );
}
