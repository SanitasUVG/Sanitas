import { useState } from "react"

/**
	* @typedef {Object} PatientPreview
	* @property {string} id
	* @property {string} name
	*/

/**
	* @typedef {Object} SearchPatientViewProps
	* @property {({query: string, type: string})=>Promise<PatientPreview[]>} searchPatientsApiCall
	*/

/**
	* @param {SearchPatientViewProps} props
	*/
export default function SearchPatientView({ searchPatientsApiCall }) {
	const [type, setType] = useState("");
	const [query, setQuery] = useState("");
	const [patients, setPatients] = useState([]);

	const searchBtnClick = async () => {
		if (query.trim().length <= 0) {
			// TODO: Display error because we can't search for an empty query
			return;
		}

		const apiPatients = await searchPatientsApiCall();
		setPatients(apiPatients ?? [])
	}

	/**
		* @param {number} id - The ID of the selected patient.
		*/
	const genViewBtnClick = (id) => {
		// TODO: Navigate to edit page view
	}

	return <div>
		<div>
			<h1>Sanitas</h1>
		</div>
		<div>
			<select value={type} onChange={(e) => setType(e.target.value)}>
				<option>Carnet Estudiante</option>
				<option>Código Colaborador</option>
				<option>Nombres y Apellidos</option>
			</select>
			<input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ingrese su búsqueda..." />
			<button type="button" onClick={searchBtnClick}>Buscar</button>
		</div>
		<div>
			{
				...patients.map(p => <div key={p.id}>
					<p>{p.names}</p>
					<button type="button" onClick={genViewBtnClick(p.id)}>Ver</button>
				</div>)
			}
		</div>
	</div>
}
