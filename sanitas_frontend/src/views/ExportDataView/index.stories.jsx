import { ToastContainer } from "react-toastify";
import { ExportDataView } from ".";
import "react-toastify/dist/ReactToastify.min.css";

export default {
	title: "Views/ExportDataView",
	component: ExportDataView,
	decorators: [
		(Story) => (
			<>
				<ToastContainer />
				<Story />
			</>
		),
	],
};

export const Default = {
	args: {},
};
