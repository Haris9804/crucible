import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import ModulePage from "../pages/ModulePage";
import TestPage from "../pages/TestPage";
import LabPage from "../pages/LabPage";
import IndividualLabPage from "../pages/IndividualLabPage";

export default function AppRoutes() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/module/:id"
        element={<ModulePage />}
      />

      <Route
        path="/test/:id"
        element={<TestPage />}
      />

      {/* LABS MAIN PAGE */}

      <Route
        path="/labs"
        element={<LabPage />}
      />

      {/* INDIVIDUAL LAB PAGE */}

      <Route
        path="/labs/:labId"
        element={<IndividualLabPage />}
      />

    </Routes>

  );

}