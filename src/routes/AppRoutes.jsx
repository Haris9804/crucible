import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import ModulePage from "../pages/ModulePage";
import TestPage from "../pages/TestPage";
import LabPage from "../pages/LabPage";
import IndividualLabPage from "../pages/IndividualLabPage";
import CtfHomePage from "../pages/ctf/CtfHomePage";
import CtfPlayPage from "../pages/ctf/CtfPlayPage";
import CtfAdminPage from "../pages/ctf/CtfAdminPage";

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

      {/* CTF — LEVEL 4 FINAL CHALLENGE */}

      <Route
        path="/ctf"
        element={<CtfHomePage />}
      />

      <Route
        path="/ctf/play"
        element={<CtfPlayPage />}
      />

      <Route
        path="/ctf/admin"
        element={<CtfAdminPage />}
      />

    </Routes>

  );

}