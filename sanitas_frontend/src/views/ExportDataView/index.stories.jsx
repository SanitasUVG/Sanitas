import { ToastContainer } from "react-toastify";
import { ExportDataView } from ".";
import "react-toastify/dist/ReactToastify.min.css";
import { MemoryRouter } from "react-router-dom";
import { delay } from "src/utils";

export default {
	title: "Views/ExportDataView",
	component: ExportDataView,
	decorators: [
		(Story) => (
			<>
				<ToastContainer />
				<MemoryRouter>
					<Story />
				</MemoryRouter>
			</>
		),
	],
};

const mockExportData = async () => {
	await delay(500);
	return { result: "test,headers" };
};

const mockExportDataError = async () => {
	await delay(500);
	return { error: "Something went wrong..." };
};

export const Default = {
	/** @type {import(".").ExportDataViewProps}*/
	args: {
		exportData: mockExportData,
	},
};
export const ServerError = {
	/** @type {import(".").ExportDataViewProps}*/
	args: {
		exportData: mockExportDataError,
	},
};
