import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { foundUserData, searchPatient } from "./dataLayer";
import { createEmptyStore } from "./store";
import { AddPatientView } from "./views/AddPatientView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateInfoView/index";

export const NAV_PATHS = {
  SEARCH_PATIENT: "/",
  ADD_PATIENT: "/form-patient",
  UPDATE_PATIENT: "/update-view",
};

const useStore = createEmptyStore();
const router = createBrowserRouter([
  {
    path: NAV_PATHS.SEARCH_PATIENT,
    element: <SearchPatientView searchPatientsApiCall={searchPatient} useStore={useStore} />,
  },
  {
    path: NAV_PATHS.ADD_PATIENT,
    element: <AddPatientView foundUserData={foundUserData} useStore={useStore} />,
  },
  {
    path: NAV_PATHS.UPDATE_PATIENT,
    element: <UpdateInfoView />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
