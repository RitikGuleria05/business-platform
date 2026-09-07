import { BrowserRouter, Navigate, Route, Routes, } from "react-router-dom";
import ChangePassword from "./pages/settings/ChangePassword";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Customers from "./pages/customers/Customers";
import Sales from "./pages/sales/Sales";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================== */}
        {/* PUBLIC ROUTES         */}
        {/* ==================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================== */}
        {/* PROTECTED ROUTES      */}
        {/* ==================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/inventory"
              element={<Inventory />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/sales"
              element={<Sales />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
            
            <Route
              path="/settings/change-password"
              element={<ChangePassword />}
            />

          </Route>

        </Route>


        {/* ==================== */}
        {/* FALLBACK              */}
        {/* ==================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;