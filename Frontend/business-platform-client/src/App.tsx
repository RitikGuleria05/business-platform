import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Customers from "./pages/customers/Customers";
import Sales from "./pages/sales/Sales";
import Settings from "./pages/settings/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import CategoriesPage from "./pages/categories/Categories";
import RolesPage from "./pages/settings/RolesPage";
import { AuthProvider } from "./hooks/auth/AuthContext";
import ChangePassword from "./pages/settings/ChangePassword";
import SalesReportPage from "./pages/reports/SalesReportPage";
import ProductReportPage from "./pages/reports/ProductReportPage";
import InventoryReportPage from "./pages/reports/InventoryReportPage";
import CustomerReportPage from "./pages/reports/CustomerReportPage";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* All authenticated routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>

                            <Route
                                path="/dashboard"
                                element={<Dashboard />}
                            />

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

                            <Route element={<ProtectedRoute permission="Inventory.View" />}>
                                <Route
                                    path="/inventory"
                                    element={<Inventory />}
                                />
                            </Route>

                            <Route element={<ProtectedRoute permission="Customer.View" />}>
                                <Route
                                    path="/customers"
                                    element={<Customers />}
                                />
                            </Route>

                            <Route
                                element={
                                    <ProtectedRoute permission="sales.read" />
                                }
                            >
                                <Route
                                    path="/sales"
                                    element={<Sales />}
                                />
                                <Route
                                    path="/reports/sales"
                                    element={<SalesReportPage />}
                                />
                            </Route>

                            <Route
                                element={
                                    <ProtectedRoute permission="reports.products" />
                                }
                            >
                                <Route
                                    path="/reports/products"
                                    element={<ProductReportPage />}
                                />
                            </Route>

                            <Route
                                element={
                                    <ProtectedRoute permission="reports.inventory" />
                                }
                            >
                                <Route
                                    path="/reports/inventory"
                                    element={<InventoryReportPage />}
                                />
                            </Route>

                            <Route
                                element={
                                    <ProtectedRoute permission="reports.customers" />
                                }
                            >
                                <Route
                                    path="/reports/customers"
                                    element={<CustomerReportPage />}
                                />
                            </Route>

                            <Route path="/settings" element={<Settings />} />

                            <Route
                                path="/settings/change-password"
                                element={<ChangePassword />}
                            />

                            <Route
                                element={<ProtectedRoute allowedRoles={["Admin"]} />}
                            >
                                <Route
                                    path="/settings/roles"
                                    element={<RolesPage />}
                                />
                            </Route>

                        </Route>
                    </Route>

                    {/* Public route */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;