import logoutIcon from "@tabler/icons/outline/logout.svg";
import settingsIcon from "@tabler/icons/outline/settings.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button";
import DropdownMenu from "src/components/DropdownMenu";
import { SearchInput } from "src/components/Input";
import { NAV_PATHS } from "src/router";

/**
 * @typedef {Object} PatientPreview
 * @property {string} id
 * @property {string} names
 */

/**
 * @typedef {Object} SearchPatientViewProps
 * @property {import("src/dataLayer.mjs").SearchPatientApiFunction} searchPatientsApiCall
 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {SearchPatientViewProps} props
 */
export default function SearchPatientView({ searchPatientsApiCall, useStore }) {
  const { query, type } = useStore((store) => store.searchQuery);
  const setSearchQuery = useStore((store) => store.setSearchQuery);
  const [patients, setPatients] = useStore((store) => [store.patients, store.setPatients]);
  const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);

  const [queryReturnedEmpty, setQueryReturnedEmpty] = useState(false);
  const [error, setError] = useState("");
  const [searchTypeWasCUI, setSearchTypeWasCUI] = useState(false);
  const navigate = useNavigate();

  const showErrorMessage = (message) => setError(`ERROR: ${message}`);
  const hideErrorMessage = () => setError("");

  const emptyQuery = query.trim().length <= 0;

  const dropdownOptions = [
    { value: "Carnet", label: "Carnet Estudiante" },
    { value: "NumeroColaborador", label: "Código Colaborador" },
    { value: "Nombres", label: "Nombres y Apellidos" },
    { value: "CUI", label: "CUI" },
  ];

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (type === "Nombres") {
      value = value.replace(/\d/g, "");
    } else if (type != "Nombres") {
      value = value.replace(/\D/g, "");
    }

    if (type === "CUI") {
      value = value.slice(0, 13);
    }
    setSearchQuery(value, type);
  };

  const searchBtnClick = async () => {
    hideErrorMessage();
    if (emptyQuery) {
      showErrorMessage("¡Por favor ingrese algo para buscar!");
      return;
    }

    const result = await searchPatientsApiCall(query, type);
    setSearchTypeWasCUI(type === "CUI");
    if (result.error) {
      const { error } = result;
      if (error.cause) {
        const { response } = error.cause;
        if (response?.status < 500) {
          showErrorMessage("Búsqueda incorrecta, ¡Por favor ingresa todos los parámetros!");
        } else {
          showErrorMessage("Ha ocurrido un error interno, lo sentimos.");
        }
      } else {
        showErrorMessage("The API has changed!");
      }
      return;
    }

    const { result: apiPatients } = result;
    setQueryReturnedEmpty(apiPatients.length <= 0);
    setPatients(apiPatients);
  };

  /**
   * @param {number} id - The ID of the selected patient.
   */
  const genViewPatientBtnClick = (id) => {
    return () => {
      setSelectedPatientId(id);
      navigate(NAV_PATHS.UPDATE_PATIENT);
    };
  };

  const onAddNewPatientClick = () => {
    navigate(NAV_PATHS.ADD_PATIENT, { state: { cui: query } });
  };

  const doNothing = () => {
    // This function does nothing
  };

  return (
    <div
      style={{
        backgroundColor: "#0F6838",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "row",
          width: "95%",
          height: "95%",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            transform: "translate(-0.06rem, -0.7rem)",
          }}
        >
          <img
            style={{
              width: "25.43rem",
              height: "20.75rem",
            }}
            src="/BorderDecoUpper.png"
            alt="Logo Sanitas"
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <img
            style={{
              width: "16rem",
              height: "auto",
            }}
            src="/Sanitas.png"
            alt="Logo Sanitas"
          />
          <h1 style={{ fontSize: "3rem", paddingBottom: "1rem" }}>Búsqueda de Pacientes</h1>
          <h3
            style={{
              fontSize: "1.75rem",
              fontFamily: "Lora, serif",
              fontWeight: "normal",
              paddingBottom: "2rem",
            }}
          >
            Ingrese carnet, código de trabajador, nombres o CUI del paciente
          </h3>

          <div>
            <DropdownMenu
              value={type}
              onChange={(e) => setSearchQuery(query, e.target.value)}
              options={dropdownOptions}
            />
            <SearchInput
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Ingrese su búsqueda..."
            />
            <Button text="Buscar" onClick={searchBtnClick} disabled={emptyQuery} />
          </div>
          <p style={{ color: "red" }}>{error}</p>
          {queryReturnedEmpty
            && (!searchTypeWasCUI
              ? (
                <div>
                  <p>¡Parece que el paciente no existe!</p>
                  <p>Prueba buscarlo por CUI.</p>
                </div>
              )
              : (
                <div>
                  <p>Ingresa la información del paciente aquí.</p>
                  <Button
                    text="Ingresar la información del paciente."
                    onClick={onAddNewPatientClick}
                  />
                </div>
              ))}
          <div>
            {...patients.map((p) => (
              <div key={p.id}>
                <p>{p.names}</p>
                <Button text="Ver" onClick={genViewPatientBtnClick(p.id)} />
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1rem 7rem 8rem",
            gridTemplateRows: "4.5rem 9rem 18rem 23.8rem",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              gridColumnStart: 4,
              gridRowStart: 2,
              flexDirection: "column",
              gap: "3rem",
              padding: "1rem 1.5rem 1rem 2rem",
            }}
          >
            <Button text="" onClick={doNothing}>
              <img
                src={settingsIcon}
                alt="Settings"
                style={{
                  width: "24px",
                  height: "24px",
                  filter: "invert(100%)",
                }}
              />
            </Button>
            <Button text="" onClick={doNothing}>
              <img
                src={logoutIcon}
                alt="Logout"
                style={{ width: "24px", height: "24px", filter: "invert(100%)" }}
              />
            </Button>
          </div>
          <img
            style={{
              width: "25rem",
              height: "20rem",
              gridRowStart: 4,
              gridColumnStart: 2,
              gridColumnEnd: 5,
            }}
            src="/BorderDecoLower.png"
            alt="Logo Sanitas"
          />
        </div>
      </div>
    </div>
  );
}
