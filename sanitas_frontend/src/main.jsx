import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SearchPatientView from "./views/SearchPatientView";
import { searchPatient } from "./dataLayer";

const router = createBrowserRouter([
	{
		path: "/",
		element: <SearchPatientView searchPatientsApiCall={searchPatient} />
	}
])

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
