import {
  BrowserRouter,
  Routes,
} from "react-router-dom";

import UserRoutes from "./UserRoutes";

import AdminRoutes from "./AdminRoutes";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {UserRoutes()}

        {AdminRoutes()}

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;