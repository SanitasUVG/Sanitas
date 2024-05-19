import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { searchPatient } from "./dataLayer";
import { createEmptyStore } from "./store";
import SearchPatientView from "./views/SearchPatientView";

const useStore = createEmptyStore();
const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchPatientView searchPatientsApiCall={searchPatient} useStore={useStore} />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
