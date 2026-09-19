import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import CategoriesPage from "./pages/categories/Categories";
import RolesPage from "./pages/settings/RolesPage";
import { AuthProvider } from "./hooks/auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTES */}
          <Route element={<MainLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Products */}
            <Route
              element={
                <ProtectedRoute permission="Product.View" />
              }
            >
              <Route
                path="/products"
                element={<Products />}
              />
            </Route>

            {/* Categories */}
            <Route
              element={
                <ProtectedRoute permission="Category.View" />
              }
            >
              <Route
                path="/categories"
                element={<CategoriesPage />}
              />
            </Route>

            {/* Inventory */}
            <Route
              element={
                <ProtectedRoute permission="Inventory.View" />
              }
            >
              <Route
                path="/inventory"
                element={<Inventory />}
              />
            </Route>

            {/* Customers */}
            <Route
              element={
                <ProtectedRoute permission="Customer.View" />
              }
            >
              <Route
                path="/customers"
                element={<Customers />}
              />
            </Route>

            {/* Sales */}
            <Route
              element={
                <ProtectedRoute permission="Sales.View" />
              }
            >
              <Route
                path="/sales"
                element={<Sales />}
              />
            </Route>

            {/* Reports */}
            <Route
              element={
                <ProtectedRoute permission="Report.View" />
              }
            >
              <Route
                path="/reports"
                element={<Reports />}
              />
            </Route>

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Change Password */}
            <Route
              path="/settings/change-password"
              element={<ChangePassword />}
            />

            {/* Roles - Admin only */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin"]} />
              }
            >
              <Route
                path="/settings/roles"
                element={<RolesPage />}
              />
            </Route>

          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;