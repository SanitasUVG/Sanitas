import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import React, { useState } from "react";
import BaseButton from "src/components/Button/Base";

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
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getGeneralPatientInformation
 * @property {Function} genViewPatientBtnClick - The function to call when the view button is clicked to set the selected patient id.
 */

/**
 * Renders a button with customizable text and an onClick event handler. The button includes
 * a hover effect where the text fades out and an arrow icon fades in.
 * @param {PatientCardProps} props
 * @returns {JSX.Element} The React Button element.
 */
export default function PatientCard({
  patientInfo,
  style = {},
  generalInfoPatientsResources,
  genViewPatientBtnClick,
}) {
  const defaultStyles = {
    mainContainer: {
      display: "flex",
      flexDirection: "column",
      width: "70%",
      height: "85%",
      borderRadius: "1rem",
      gap: "2rem",
      ...style.mainContainer,
    },
    secondaryContainer: {
      display: "flex",
      flexDirection: "column",
      width: "80%",
      justifyContent: "center",
      paddingLeft: "3rem",
      gap: "1rem",
      ...style.secondaryContainer,
    },
    cardsContainer: {
      display: "flex",
      flexDirection: "row",
      border: "0.125rem solid #0F6838",
      height: "10rem",
      borderRadius: "1rem",
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

  // Read data inside component
  patientInfo = generalInfoPatientsResources ? generalInfoPatientsResources.read() : [];

  return (
    <div style={defaultStyles.mainContainer}>
      {patientInfo.map((patient) => (
        <div key={patient.id} style={defaultStyles.cardsContainer}>
          <React.Fragment key={patient.id}>
            <div style={defaultStyles.secondaryContainer}>
              <h2 style={defaultStyles.patientName}>{`${patient.names} ${patient.lastNames}`}</h2>
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
          </React.Fragment>
        </div>
      ))}
    </div>
  );
}
