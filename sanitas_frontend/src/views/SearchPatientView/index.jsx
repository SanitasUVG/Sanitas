/**
 * @typedef {Object} PatientPreview
 * @property {string} id
 * @property {string} names
 */

/**
 * @typedef {Object} SearchPatientViewProps
 * @property {({query: string, type: string})=>Promise<PatientPreview[]>} searchPatientsApiCall
 * @property {import("src/store").UseStoreHook} useStore
 */

/**
 * @param {SearchPatientViewProps} props
 */
export default function SearchPatientView({ searchPatientsApiCall, useStore }) {
  const { query, type } = useStore(store => store.searchQuery);
  const setSearchQuery = useStore(store => store.setSearchQuery);
  const [patients, setPatients] = useStore(store => [store.patients, store.setPatients]);

  const searchBtnClick = async () => {
    if (query.trim().length <= 0) {
      // TODO: Display error because we can't search for an empty query
      return;
    }

    const apiPatients = await searchPatientsApiCall();
    setPatients(apiPatients ?? []);
  };

  /**
   * @param {number} id - The ID of the selected patient.
   */
  const genViewBtnClick = (id) => {
    // TODO: Navigate to edit page view
  };

  return (
    <div>
      <div>
        <h1>Sanitas</h1>
      </div>
      <div>
        <select value={type} onChange={(e) => setSearchQuery(query, e.target.value)}>
          <option>Carnet Estudiante</option>
          <option>Código Colaborador</option>
          <option>Nombres y Apellidos</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchQuery(e.target.value, type)}
          placeholder="Ingrese su búsqueda..."
        />
        <button type="button" onClick={searchBtnClick}>Buscar</button>
      </div>
      <div>
        {...patients.map(p => (
          <div key={p.id}>
            <p>{p.names}</p>
            <button type="button" onClick={genViewBtnClick(p.id)}>Ver</button>
          </div>
        ))}
      </div>
    </div>
  );
}
