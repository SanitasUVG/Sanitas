import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { foundUserData, searchPatient } from "./dataLayer";
import { createEmptyStore } from "./store";
import { AddPatientView } from "./views/AddPatientView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateInfoView/index";

const useStore = createEmptyStore();
const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchPatientView searchPatientsApiCall={searchPatient} useStore={useStore} />,
  },
  {
    path: "/form-patient",
    element: <AddPatientView foundUserData={foundUserData} useStore={useStore} />,
  },
  {
    path: "/update-view",
    element: <UpdateInfoView />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
