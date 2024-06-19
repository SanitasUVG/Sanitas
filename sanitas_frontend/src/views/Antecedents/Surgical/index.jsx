import React from "react";
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
  getSurgicalHistory,
  updateSurgicalHistory,
  sidebarConfig,
  useStore,
}) {
  const id = useStore((s) => s.selectedPatientId);

  const handleSubmit = async () => {};

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
          width: "20%",
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
              gap: "5rem",
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
              <BaseButton
                text="Agregar antecedente qurúrjico"
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  height: "3rem",
                }}
              />
            </div>
            <div
              style={{
                border: `1px solid ${colors.primaryBackground}`,
                borderRadius: "10px",
                padding: "1rem",
                height: "65vh",
                flex: 1.8,
                overflowY: "auto",
              }}
            >
              <p>¿De qué?</p>
              <BaseInput placeholder="Ingrese acá el motivo o tipo de cirugía" />
              <p>¿En que año?</p>
              <DropdownMenu
                options={[
                  { value: 1, label: "2021" },
                  { value: 2, label: "2020" },
                  { value: 3, label: "2019" },
                ]}
              />
              <p>¿Tuvo alguna complicación?</p>
              <BaseInput placeholder="Ingrese acá complicaciones que pudo haber tenido durante
o  después de la cirugía." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
