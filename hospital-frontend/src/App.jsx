import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import Departments from "./pages/Departments";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";


import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}

                <Route path="/" element={<Login />} />

                <Route path="/login" element={<Login />} />


                {/* Dashboard */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN", "DOCTOR", "PATIENT"]}
                        >
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* Patients */}

                <Route
                    path="/patients"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN", "PATIENT"]}
                        >
                            <Layout>
                                <Patients />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* Doctors */}

                <Route
                    path="/doctors"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <Layout>
                                <Doctors />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/departments"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Layout>
                                <Departments />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* Appointments */}

                <Route
                    path="/appointments"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN", "DOCTOR", "PATIENT"]}
                        >
                            <Layout>
                                <Appointments />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* Prescriptions */}

                <Route
                    path="/prescriptions"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN", "DOCTOR", "PATIENT"]}
                        >
                            <Layout>
                                <Prescriptions />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                {/* Billing */}

                <Route
                    path="/billing"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN", "PATIENT"]}
                        >
                            <Layout>
                                <Billing />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Layout>
                                <Reports />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>




        </BrowserRouter>
    );
}

export default App;