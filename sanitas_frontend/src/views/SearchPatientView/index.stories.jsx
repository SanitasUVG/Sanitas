import SearchPatientView from ".";

export default {
	component: SearchPatientView
}

export const Default = {
	args: {
		searchPatientsApiCall: () => {
			return new Promise(res => {
				res([{
					id: 1234,
					names: "Flavio"
				}])
			})
		}
	}
}
