import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { colors } from "src/theme.mjs";
import arrowLeft from "@tabler/icons/outline/arrow-narrow-left.svg";
import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";

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

	useEffect(() => {
		const currentPath = location.pathname;
		const activeKey = sections.find((section) =>
			currentPath.includes(section.key),
		)?.key;
		if (activeKey) {
			setActiveSection(activeKey);
		}
	}, [location]);

	const navigateToIndex = (indexChange) => {
		const newIndex = currentIndex + indexChange;
		if (newIndex >= 0 && newIndex < sections.length) {
			setActiveSection(sections[newIndex].key);
			navigate(sections[newIndex].navigateTo());
		}
	};

	const sections = [
		{ key: "general", text: "Generales", navigateTo: navigateToGeneralStudent },
		{
			key: "familiares",
			text: "Familiares",
			navigateTo: navigateToFamiliarStudent,
		},
		{
			key: "personales",
			text: "Personales",
			navigateTo: navigateToPersonalStudent,
		},
		{
			key: "alergicos",
			text: "Alérgicos",
			navigateTo: navigateToAllergiesStudent,
		},
		{
			key: "quirurgicos",
			text: "Quirúrgicos",
			navigateTo: navigateToSurgicalStudent,
		},
		{
			key: "traumatologicos",
			text: "Traumatológicos",
			navigateTo: navigateToTraumatologicalStudent,
		},
		{
			key: "psiquiatricos",
			text: "Psiquiátricos",
			navigateTo: navigateToPsiquiatricStudent,
		},
		{
			key: "ginecoobstetricos",
			text: "Ginecoobstétricos",
			navigateTo: navigateToObstetricsStudent,
		},
		{
			key: "no_patologicos",
			text: "No Patológicos",
			navigateTo: navigateToNonPathologicalStudent,
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
				style={{ cursor: "pointer" }}
			/>

			{sections.map((section) => (
				<button
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
				style={{ cursor: "pointer" }}
			/>
		</div>
	);
}
