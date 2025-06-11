import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import PageNotFound from '../pages/PageNotFound/PageNotFound';
import OraculumHR from "../pages/OraculumHR/OraculumHR";

const LayoutWithNavbar = () => (
  <>
    <Outlet />
  </>
);

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OraculumHR />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


export default ProtectedRoutes;
