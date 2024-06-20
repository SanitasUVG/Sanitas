import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import React, { useEffect, useState } from "react";
import BaseButton from "src/components/Button/Base";
import { colors, fonts } from "src/theme.mjs";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} PatientInfo
 * @property {number} cui - The unique identifier of the patient.
 * @property {string} names - The names of the patient.
 * @property {string} lastNames - The last names of the patient.
 * @property {number} age - The age of the patient.
 */

/**
 * @typedef {Object} PatientCardProps
 * @property {PatientInfo} patientInfo - The patient information.
 * @property {{mainContainer: React.CSSProperties, secondaryContainer: React.CSSProperties, cardsContainer: React.CSSProperties, patientName: React.CSSProperties, patientAge: React.CSSProperties, patientCUI: React.CSSProperties}} [style] - Custom styles for sub-components:
 *        - `style.mainContainer`: Styles for the main container of the card.
 *        - `style.cardsContainer`: Styles for the cards container.
 *        - `style.secondaryContainer`: Styles for the patientInfo inside the card.
 *        - `style.patientName`: Styles for the patient's name and lastName.
 *        - `style.patientAge`: Styles for the patient's age.
 *        - `style.patientCUI`: Styles for the patient's CUI.
 * @property {import('src/utils/promiseWrapper').SuspenseResource<import('src/dataLayer.mjs').Result<import('src/dataLayer.mjs').APIPatient, Error>>} patientsResources
 * @property {Function} genViewPatientBtnClick - The function to call when the view button is clicked to set the selected patient id.
 * @property {Function} setQueryReturnedEmpty - The function to call when the query returns an empty result.
 * @property {Function} adjustHeight - The function to adjust the height of the component.
 * @property {Function} adjustWidth - The function to adjust the width of the component.
 */

/**
 * Renders a button with customizable text and an onClick event handler. The button includes
 * a hover effect where the text fades out and an arrow icon fades in.
 * @param {PatientCardProps} props
 * @returns {JSX.Element} The React Button element.
 */
export default function PatientCard({
  style = {},
  patientsResources,
  genViewPatientBtnClick,
  setQueryReturnedEmpty,
  adjustHeight,
  adjustWidth,
}) {
  const { width, height } = useWindowSize();

  const defaultStyles = {
    mainContainer: {
      display: "flex",
      flexDirection: "column",
      width: "70%",
      height: "85%",
      overflowX: "hidden",
      overflowY: "auto",
      ...style.mainContainer,
    },
    secondaryContainer: {
      display: "flex",
      flexDirection: "column",
      width: "80%",
      justifyContent: "center",
      ...style.secondaryContainer,
    },
    cardsContainer: {
      display: "flex",
      flexDirection: "row",
      border: "0.125rem solid #0F6838",
      ...style.cardsContainer,
    },
    patientName: {
      ...style.patientName,
    },
    patientAge: {
      fontWeight: "normal",
      ...style.patientAge,
    },
    patientCUI: {
      fontWeight: "normal",
      ...style.patientCUI,
    },
  };

  const result = patientsResources.read();
  if (result.error) {
    let errorMessage = "";
    if (result.error && result.error.cause) {
      const { response } = result.error.cause;
      if (response?.status < 500) {
        errorMessage = "Búsqueda incorrecta, ¡Por favor ingresa todos los parámetros!";
      } else {
        errorMessage = "Ha ocurrido un error interno, lo sentimos.";
      }
    } else {
      errorMessage = "Error processing your search request.";
    }

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
            width: adjustWidth(width, "25rem"),
            fontSize: adjustWidth(width, "2rem"),
            textAlign: "center",
            fontFamily: fonts.textFont,
            color: colors.statusDenied,
          }}
        >
          {errorMessage}
        </div>
      </div>
    );
  }

  const patientInfo = result.result;

  useEffect(() => {
    setQueryReturnedEmpty(patientInfo.length <= 0);
  }, [patientInfo]);

  return (
    <div style={defaultStyles.mainContainer}>
      {patientInfo.map((patient) => (
        <div key={patient.id} style={defaultStyles.cardsContainer}>
          <div style={defaultStyles.secondaryContainer}>
            <h2 style={defaultStyles.patientName}>{`${patient.names}`}</h2>
            <h3 style={defaultStyles.patientAge}>{`Edad: ${patient.age} años`}</h3>
            <h3 style={defaultStyles.patientCUI}>{`CUI: ${patient.cui}`}</h3>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20%",
            }}
          >
            <BaseButton text="Ver" onClick={genViewPatientBtnClick(patient.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}
