import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { colors } from "src/theme.mjs";
import arrowLeft from "@tabler/icons/outline/arrow-narrow-left.svg";
import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";

/**
 * @callback NavigationHandler
 * Defines a navigation handler which is a function that performs navigation without taking any parameters.
 * This is used for navigating to various sections of a student dashboard.
 */

/**
 * @typedef {Object} StudentDashboardTopbarProps
 * @property {string} activeSectionProp - The key of the currently active section.
 * @property {NavigationHandler} navigateToGeneralStudent - Function to navigate to the general student information section.
 * @property {NavigationHandler} navigateToPersonalStudent - Function to navigate to the personal student information section.
 * @property {NavigationHandler} navigateToFamiliarStudent - Function to navigate to the familiar student information section.
 * @property {NavigationHandler} navigateToAllergiesStudent - Function to navigate to the allergies student information section.
 * @property {NavigationHandler} navigateToObstetricsStudent - Function to navigate to the obstetrics student information section.
 * @property {NavigationHandler} navigateToNonPathologicalStudent - Function to navigate to the non-pathological student information section.
 * @property {NavigationHandler} navigateToPsiquiatricStudent - Function to navigate to the psychiatric student information section.
 * @property {NavigationHandler} navigateToSurgicalStudent - Function to navigate to the surgical student information section.
 * @property {NavigationHandler} navigateToTraumatologicalStudent - Function to navigate to the traumatological student information section.
 */

/**
 * Component that renders the top bar of the Student Dashboard with navigation buttons for various sections.
 * Each button is associated with a function that allows navigation to a different part of the student profile.
 *
 * @param {StudentDashboardTopbarProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered component, consisting of navigation buttons and potentially other UI elements for switching between student information sections.
 */
export default function StudentDashboardTopbar({
	activeSectionProp,
	navigateToGeneralStudent,
	navigateToPersonalStudent,
	navigateToFamiliarStudent,
	navigateToAllergiesStudent,
	navigateToObstetricsStudent,
	navigateToNonPathologicalStudent,
	navigateToPsiquiatricStudent,
	navigateToSurgicalStudent,
	navigateToTraumatologicalStudent,
}) {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState(activeSectionProp);
	const { pathname } = useLocation();

	useEffect(() => {
		const activeKey = sections.find((section) =>
			pathname.includes(section.key),
		)?.key;
		if (activeKey) {
			setActiveSection(activeKey);
		}
	}, [pathname]);

	const navigateToIndex = (indexChange) => {
		const newIndex = currentIndex + indexChange;
		if (newIndex >= 0 && newIndex < sections.length) {
			setActiveSection(sections[newIndex].key);
			sections[newIndex].navigateTo(navigate);
		}
	};

	const sections = [
		{
			key: "general",
			text: "Generales",
			navigateTo: navigateToGeneralStudent(),
		},
		{
			key: "familiares",
			text: "Familiares",
			navigateTo: navigateToFamiliarStudent(),
		},
		{
			key: "personales",
			text: "Personales",
			navigateTo: navigateToPersonalStudent(),
		},
		{
			key: "alergicos",
			text: "Alérgicos",
			navigateTo: navigateToAllergiesStudent(),
		},
		{
			key: "quirurgicos",
			text: "Quirúrgicos",
			navigateTo: navigateToSurgicalStudent(),
		},
		{
			key: "traumatologicos",
			text: "Traumatológicos",
			navigateTo: navigateToTraumatologicalStudent(),
		},
		{
			key: "psiquiatricos",
			text: "Psiquiátricos",
			navigateTo: navigateToPsiquiatricStudent(),
		},
		{
			key: "ginecoobstetricos",
			text: "Ginecoobstétricos",
			navigateTo: navigateToObstetricsStudent(),
		},
		{
			key: "no_patologicos",
			text: "No Patológicos",
			navigateTo: navigateToNonPathologicalStudent(),
		},
	];

	const currentIndex = sections.findIndex(
		(section) => section.key === activeSection,
	);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				backgroundColor: colors.secondaryBackground,
				padding: "1rem",
				borderRadius: "0.625rem",
				width: "100%",
				height: "100%",
				justifyContent: "center",
				gap: "1rem",
			}}
		>
			<img
				src={arrowLeft}
				alt="Anterior"
				onClick={() => navigateToIndex(-1)}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						navigateToIndex(-1);
					}
				}}
				style={{ cursor: "pointer" }}
			/>

			{sections.map((section) => (
				<button
					type="button"
					key={section.key}
					onClick={() => {
						setActiveSection(section.key);
						section.navigateTo(navigate);
					}}
					style={{
						backgroundColor:
							activeSection === section.key ? "#0F6838" : "#E6E7E7",
						color: activeSection === section.key ? "white" : "black",
						padding: "0.7rem",
						border: "none",
						cursor: "pointer",
						borderRadius: "0.7rem",
						flex: "1",
					}}
				>
					{section.text}
				</button>
			))}
			<img
				src={arrowRight}
				alt="Siguiente"
				onClick={() => navigateToIndex(1)}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						navigateToIndex(1);
					}
				}}
				style={{ cursor: "pointer" }}
			/>
		</div>
	);
}
