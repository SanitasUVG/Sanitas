import boneicon from "@tabler/icons/outline/bone.svg";
import brainicon from "@tabler/icons/outline/brain.svg";
import facemaskicon from "@tabler/icons/outline/face-mask.svg";
import flowericon from "@tabler/icons/outline/flower.svg";
import glassicon from "@tabler/icons/outline/glass-full.svg";
import stethoscopeicon from "@tabler/icons/outline/stethoscope.svg";
import userloveicon from "@tabler/icons/outline/user-heart.svg";
import usericon from "@tabler/icons/outline/user.svg";
import familyicon from "@tabler/icons/outline/users-group.svg";
import womanicon from "@tabler/icons/outline/woman.svg";
import { useNavigate } from "react-router-dom";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import { colors, fonts, fontSize } from "src/theme.mjs";
import TextIconButton from "../Button/TextIcon";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

/**
 * @callback SidebarNavigationHandler
 * @param {import("react-router-dom").NavigateFunction} navigate - The navigate returned from `useNavigate()`
 * @param {import("react").MouseEvent} e - The `MouseEvent` that triggered this handler.
 */

/**
 * @typedef {Object} DashboardSidebarProps
 * @property {SidebarNavigationHandler} navigateToGeneral - Handles navigation to the update general patient information view.
 * @property {SidebarNavigationHandler} navigateToAppointments - Handles navigation to the appointments view.
 * @property {SidebarNavigationHandler} navigateToPersonal - Handles navigation to the update personal information view.
 * @property {SidebarNavigationHandler} navigateToFamiliar - Handles navigation to the update familiar information view.
 * @property {SidebarNavigationHandler} navigateToAllergies - Handles navigation to the update allergies view.
 * @property {SidebarNavigationHandler} navigateToObstetrics - Handles navigation to the update obstetrics gynecologists view.
 * @property {SidebarNavigationHandler} navigateToNonPathological - Handles navigation to the update non pathological view.
 * @property {SidebarNavigationHandler} navigateToPsiquiatric - Handles navigation to the update psiquiatric view.
 * @property {SidebarNavigationHandler} navigateToSurgical - Handles navigation to the update surgical view.
 * @property {SidebarNavigationHandler} navigateToTraumatological - Handles navigation to the update traumatological view.
 * @property {SidebarNavigationHandler} onGoBack - Function that fires when the Back button is pressed.
 * @property {import("src/dataLayer.mjs").GetMedicalHistoryMetadataCallback} getMedicalHistoryMetadata - Function to get the current active medical history data.
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/dataLayer.mjs").GetCurrentUserCallback} getCurrentUser - Function to get the current user data
 */

/**
 * @param {DashboardSidebarProps} props
 */
export default function DashboardSidebar({
	navigateToGeneral,
	navigateToAppointments,
	navigateToPersonal,
	navigateToFamiliar,
	navigateToAllergies,
	navigateToObstetrics,
	navigateToNonPathological,
	navigateToPsiquiatric,
	navigateToSurgical,
	navigateToTraumatological,
	onGoBack,
	getMedicalHistoryMetadata,
	useStore,
	getCurrentUser,
}) {
	const navigate = useNavigate();
	const wrapWithNavigate = (func) => {
		/**
		 * @type {import("react").MouseEventHandler}
		 */
		return (e) => {
			func(navigate, e);
		};
	};
	const patientId = useStore((s) => s.selectedPatientId);
	const prefixesWithData = useStore((s) => s.prefixesWithData);
	const setPrefixesWithData = useStore((s) => s.setPrefixesWithData);
	const displayName = useStore((s) => s.displayName);
	const isWoman = useStore((s) => s.isWoman);
	const [userEmail, setUserEmail] = useState("");

	useEffect(() => {
		const loadPrefixes = async () => {
			const response = await getMedicalHistoryMetadata(patientId);
			if (response.error) {
				toast.error(
					"Ha ocurrido un error obteniendo los antecedentes ya llenados!",
				);
				return;
			}

			setPrefixesWithData(response.result);
		};

		loadPrefixes();
	}, [patientId, setPrefixesWithData, getMedicalHistoryMetadata]);

	useEffect(() => {
		const loadUserData = async () => {
			try {
				const user = await getCurrentUser();
				if (user && user.email) {
					setUserEmail(user.email);
				} else {
					setUserEmail("Usuario desconocido");
				}
			} catch (error) {
				console.error("Error al obtener el usuario actual:", error);
				setUserEmail("Error al cargar usuario");
			}
		};

		loadUserData();
	}, [getCurrentUser]);

	const genStyleWithPrefix = (prefix) => {
		return !prefixesWithData.includes(prefix)
			? {
					color: colors.darkerGrey,
				}
			: {};
	};

	const genIconStyleWithPrefix = (prefix) => {
		return !prefixesWithData.includes(prefix)
			? {
					filter: "contrast(0%)",
				}
			: {};
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: colors.secondaryBackground,
				padding: "1rem",
				borderRadius: "0.625rem",
				width: "100%",
				height: "100%",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignContent: "center",
					cursor: "pointer",
					width: "100%",
				}}
			>
				<img
					style={{
						width: "60%",
						flexGrow: 0,
					}}
					src={SanitasLogo}
					onClick={wrapWithNavigate(onGoBack)}
					onKeyDown={wrapWithNavigate(onGoBack)}
					alt="Logo Sanitas"
				/>
			</div>
			<div
				style={{
					display: "flex",
					padding: "1.5rem 0",
					width: "100%",
				}}
			>
				<div
					style={{
						paddingLeft: "0.8rem",
						flexGrow: 1,
					}}
				>
					<h1
						style={{
							fontFamily: fonts.titleFont,
							fontSize: "0.9rem",
							paddingBottom: ".4rem",
						}}
					>
						{userEmail}
					</h1>
					<h2
						style={{
							fontFamily: fonts.titleFont,
							fontWeight: "normal",
							fontSize: "0.9rem",
						}}
					>
						Doctora
					</h2>
				</div>
			</div>

			<TextIconButton
				icon={usericon}
				text="General"
				onClick={wrapWithNavigate(navigateToGeneral)}
			/>
			<TextIconButton
				icon={stethoscopeicon}
				text="Citas"
				onClick={wrapWithNavigate(navigateToAppointments)}
			/>

			<h3
				style={{
					color: colors.darkerGrey,
					fontSize: fontSize.textSize,
					fontWeight: "normal",
					paddingBottom: "1rem",
					paddingTop: "1rem",
					borderBottom: `0.04rem solid ${colors.darkerGrey}`,
				}}
			>
				Antecedentes
			</h3>
			<div
				style={{
					paddingTop: "1rem",
				}}
			>
				<TextIconButton
					icon={familyicon}
					text="Familiares"
					onClick={wrapWithNavigate(navigateToFamiliar)}
					style={genStyleWithPrefix("af")}
					iconStyle={genIconStyleWithPrefix("af")}
				/>
				<TextIconButton
					icon={userloveicon}
					text="Personales"
					onClick={wrapWithNavigate(navigateToPersonal)}
					style={genStyleWithPrefix("ap")}
					iconStyle={genIconStyleWithPrefix("ap")}
				/>
				<TextIconButton
					icon={flowericon}
					text="Alérgicos"
					onClick={wrapWithNavigate(navigateToAllergies)}
					style={genStyleWithPrefix("aa")}
					iconStyle={genIconStyleWithPrefix("aa")}
				/>
				<TextIconButton
					icon={facemaskicon}
					text="Quirúrgicos"
					onClick={wrapWithNavigate(navigateToSurgical)}
					style={genStyleWithPrefix("aq")}
					iconStyle={genIconStyleWithPrefix("aq")}
				/>
				<TextIconButton
					icon={boneicon}
					text="Traumatológicos"
					onClick={wrapWithNavigate(navigateToTraumatological)}
					style={genStyleWithPrefix("at2")}
					iconStyle={genIconStyleWithPrefix("at2")}
				/>
				<TextIconButton
					icon={brainicon}
					text="Psiquiátricos"
					onClick={wrapWithNavigate(navigateToPsiquiatric)}
					style={genStyleWithPrefix("ap2")}
					iconStyle={genIconStyleWithPrefix("ap2")}
				/>
				<TextIconButton
					icon={womanicon}
					text="Ginecoobstétricos"
					onClick={isWoman ? wrapWithNavigate(navigateToObstetrics) : () => {}}
					style={genStyleWithPrefix("ag")}
					iconStyle={genIconStyleWithPrefix("ag")}
				/>
				<TextIconButton
					icon={glassicon}
					text="No patológicos"
					onClick={wrapWithNavigate(navigateToNonPathological)}
					style={genStyleWithPrefix("anp")}
					iconStyle={genIconStyleWithPrefix("anp")}
				/>
			</div>
		</div>
	);
}
