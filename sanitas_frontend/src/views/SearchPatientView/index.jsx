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
    return () => navigate(NAV_PATHS.UPDATE_PATIENT, { state: { id } });
  };

  const onAddNewPatientClick = () => {
    navigate(NAV_PATHS.ADD_PATIENT);
  };

  return (
    <div>
      <div>
        <h1>Sanitas</h1>
      </div>
      <div>
        {
          // NOTE: The default value is defined in the store.
        }
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
              <p>¡Parece que el paciente no existe!</p>
              <p>Ingresa la información del paciente aquí.</p>
              <Button text="Ingresar la información del paciente" onClick={onAddNewPatientClick} />
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
  );
}
