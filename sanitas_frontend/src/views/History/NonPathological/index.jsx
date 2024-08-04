import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import IconButton from "src/components/Button/Icon";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";

export function NonPathologicalHistory({
  getNonPathologicalHistory,
  getBloodTypePatientInfo,
  updateNonPathologicalHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);
  const bloodTypeResource = WrapPromise(getBloodTypePatientInfo(id));
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
                bloodTypeResource={bloodTypeResource}
                updateNonPathologicalHistory={updateNonPathologicalHistory}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function NonPathologicalView({
  id,
  nonPathologicalHistoryResource,
  bloodTypeResource,
  updateNonPathologicalHistory,
}) {
  const [isEditable, setIsEditable] = useState(false);

  const nonPathologicalHistoryData = nonPathologicalHistoryResource.read();
  const bloodTypeResult = bloodTypeResource.read();

  const [smokingStatus, setSmokingStatus] = useState(
    () => nonPathologicalHistoryData?.smoker?.data?.[0]?.smokes ?? false,
  );
  const [cigarettesPerDay, setCigarettesPerDay] = useState(
    () => nonPathologicalHistoryData?.smoker?.data?.[0]?.cigarettesPerDay ?? "",
  );
  const [smokingYears, setSmokingYears] = useState(
    () => nonPathologicalHistoryData?.smoker?.data?.[0]?.years ?? "",
  );
  const [alcoholConsumption, setAlcoholConsumption] = useState(
    () => nonPathologicalHistoryData?.drink?.data?.[0]?.drinks ?? false,
  );
  const [drinksPerMonth, setDrinksPerMonth] = useState(
    () => nonPathologicalHistoryData?.drink?.data?.[0]?.drinksPerMonth ?? "",
  );
  const [drugUse, setDrugUse] = useState(
    () => nonPathologicalHistoryData?.drugs?.data?.[0]?.usesDrugs ?? false,
  );
  const [drugType, setDrugType] = useState(
    () => nonPathologicalHistoryData?.drugs?.data?.[0]?.type ?? "",
  );
  const [drugFrequency, setDrugFrequency] = useState(
    () => nonPathologicalHistoryData?.drugs?.data?.[0]?.frequency ?? "",
  );

  const isFirstTime = !nonPathologicalHistoryData
    || ((!nonPathologicalHistoryData.smoker?.data
      || nonPathologicalHistoryData.smoker.data.length === 0)
      && (!nonPathologicalHistoryData.drink?.data
        || nonPathologicalHistoryData.drink.data.length === 0)
      && (!nonPathologicalHistoryData.drugs?.data
        || nonPathologicalHistoryData.drugs.data.length === 0));

  let errorMessage = "";
  if (nonPathologicalHistoryData.error) {
    const error = nonPathologicalHistoryData.error;
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

  const [nonPathologicalHistory, setNonPathologicalHistory] = useState({
    smokingStatus: {
      data: nonPathologicalHistoryData?.smoker?.data?.[0]?.status ?? false,
      version: nonPathologicalHistoryData?.smoker?.version ?? 1,
    },
    cigarettesPerDay: {
      data: nonPathologicalHistoryData?.smoker?.data?.[0]?.cigarettesPerDay ?? "",
      version: nonPathologicalHistoryData?.smoker?.version ?? 1,
    },
    smokingYears: {
      data: nonPathologicalHistoryData?.smoker?.data?.[0]?.years ?? "",
      version: nonPathologicalHistoryData?.smoker?.version ?? 1,
    },
    alcoholConsumption: {
      data: nonPathologicalHistoryData?.drink?.data?.[0]?.status ?? false,
      version: nonPathologicalHistoryData?.drink?.version ?? 1,
    },
    drinksPerMonth: {
      data: nonPathologicalHistoryData?.drink?.data?.[0]?.drinksPerMonth ?? "",
      version: nonPathologicalHistoryData?.drink?.version ?? 1,
    },
    drugUse: {
      data: nonPathologicalHistoryData?.drugs?.data?.[0]?.status ?? false,
      version: nonPathologicalHistoryData?.drugs?.version ?? 1,
    },
    drugType: {
      data: nonPathologicalHistoryData?.drugs?.data?.[0]?.type ?? "",
      version: nonPathologicalHistoryData?.drugs?.version ?? 1,
    },
    drugFrequency: {
      data: nonPathologicalHistoryData?.drugs?.data?.[0]?.frequency ?? "",
      version: nonPathologicalHistoryData?.drugs?.version ?? 1,
    },
  });

  const handleSaveNonPathological = async () => {
    const updateDetails = {
      bloodType: bloodTypeResult?.result?.bloodType,
      smoker: {
        version: nonPathologicalHistory.smokingStatus.version,
        data: [
          {
            smokes: smokingStatus,
            cigarettesPerDay: parseInt(cigarettesPerDay),
            years: parseInt(smokingYears),
          },
        ],
      },
      drink: {
        version: nonPathologicalHistory.alcoholConsumption.version,
        data: [
          {
            drinks: alcoholConsumption,
            drinksPerMonth: parseInt(drinksPerMonth),
          },
        ],
      },
      drugs: {
        version: nonPathologicalHistory.drugUse.version,
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
      console.log("Updated successfully");
      // Aquí puedes manejar la lógica post-actualización, como cerrar un modal o actualizar un estado.
    } else {
      toast.error("Error al actualizar los antecedentes no patológicos: " + result.error);
      console.error("Failed to update", result.error);
      // Manejar error aquí
    }
  };

  const handleCancel = () => {
    setIsEditable(false);
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
                }}
              >
                <p
                  style={{
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
