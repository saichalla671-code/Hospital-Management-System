
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardCharts from "../components/DashboardCharts";

function Dashboard() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [billings, setBillings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get logged-in user's role from JWT
    let role = "";

    try {
        const token = localStorage.getItem("token");

        if (token) {
            const decoded = jwtDecode(token);
            role = (decoded.role || "").replace("ROLE_", "").toUpperCase();
        }
    } catch (err) {
        console.error("Invalid token:", err);
    }

    // Extract array from API response
    const getList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    // Load data according to role
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError("");

            let requests = [];

            if (role === "ADMIN") {
                requests = [
                    { key: "appointments", url: "/appointments" },
                    { key: "patients", url: "/patients" },
                    { key: "doctors", url: "/doctors" },
                    { key: "departments", url: "/departments" }
                ];
            } else if (role === "DOCTOR") {
                requests = [
                    { key: "appointments", url: "/appointments" },
                    { key: "prescriptions", url: "/prescriptions" }
                ];
            } else if (role === "PATIENT") {
                requests = [
                    { key: "appointments", url: "/appointments" },
                    { key: "prescriptions", url: "/prescriptions" },
                    { key: "billings", url: "/billings" }
                ];
            } else {
                setError("Invalid user role. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const results = await Promise.allSettled(
                    requests.map(item => api.get(item.url))
                );

                const setters = {
                    appointments: setAppointments,
                    patients: setPatients,
                    doctors: setDoctors,
                    departments: setDepartments,
                    prescriptions: setPrescriptions,
                    billings: setBillings
                };

                let failedRequests = 0;

                results.forEach((result, index) => {
                    const key = requests[index].key;

                    if (result.status === "fulfilled") {
                        setters[key](getList(result.value.data));
                    } else {
                        failedRequests++;
                        console.error(
                            `Failed to load ${key}:`,
                            result.reason
                        );
                        setters[key]([]);
                    }
                });

                if (failedRequests === requests.length) {
                    setError(
                        "Unable to load dashboard data. Please check your login and backend."
                    );
                } else if (failedRequests > 0) {
                    setError(
                        "Some dashboard information could not be loaded."
                    );
                }
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Unable to load dashboard information.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [role]);

    // Appointment status counts
    const getCount = (status) =>
        appointments.filter(
            appointment =>
                (appointment.status || "").toUpperCase() === status
        ).length;

    const scheduled = getCount("SCHEDULED");
    const confirmed = getCount("CONFIRMED");
    const completed = getCount("COMPLETED");
    const cancelled = getCount("CANCELLED");

    // Admin statistics
    const adminStats = [
        {
            title: "Total Appointments",
            count: appointments.length,
            icon: "📅",
            color: "blue",
            path: "/appointments"
        },
        {
            title: "Scheduled",
            count: scheduled,
            icon: "🕒",
            color: "orange",
            path: "/appointments"
        },
        {
            title: "Confirmed",
            count: confirmed,
            icon: "✓",
            color: "green",
            path: "/appointments"
        },
        {
            title: "Completed",
            count: completed,
            icon: "✔",
            color: "teal",
            path: "/appointments"
        },
        {
            title: "Cancelled",
            count: cancelled,
            icon: "✕",
            color: "red",
            path: "/appointments"
        },
        {
            title: "Total Patients",
            count: patients.length,
            icon: "👥",
            color: "purple",
            path: "/patients"
        },
        {
            title: "Total Doctors",
            count: doctors.length,
            icon: "🩺",
            color: "blue",
            path: "/doctors"
        },
        {
            title: "Departments",
            count: departments.length,
            icon: "🏢",
            color: "orange",
            path: "/departments"
        }
    ];

    // Doctor statistics
    const doctorStats = [
        {
            title: "My Appointments",
            count: appointments.length,
            icon: "📅",
            color: "blue",
            path: "/appointments"
        },
        {
            title: "Scheduled",
            count: scheduled,
            icon: "🕒",
            color: "orange",
            path: "/appointments"
        },
        {
            title: "Confirmed",
            count: confirmed,
            icon: "✓",
            color: "green",
            path: "/appointments"
        },
        {
            title: "Completed",
            count: completed,
            icon: "✔",
            color: "teal",
            path: "/appointments"
        },
        {
            title: "Prescriptions",
            count: prescriptions.length,
            icon: "💊",
            color: "purple",
            path: "/prescriptions"
        }
    ];

    // Patient statistics
    const patientStats = [
        {
            title: "My Appointments",
            count: appointments.length,
            icon: "📅",
            color: "blue",
            path: "/appointments"
        },
        {
            title: "Scheduled",
            count: scheduled,
            icon: "🕒",
            color: "orange",
            path: "/appointments"
        },
        {
            title: "Confirmed",
            count: confirmed,
            icon: "✓",
            color: "green",
            path: "/appointments"
        },
        {
            title: "Completed",
            count: completed,
            icon: "✔",
            color: "teal",
            path: "/appointments"
        },
        {
            title: "My Prescriptions",
            count: prescriptions.length,
            icon: "💊",
            color: "purple",
            path: "/prescriptions"
        },
        {
            title: "My Billing Records",
            count: billings.length,
            icon: "💰",
            color: "orange",
            path: "/billing"
        }
    ];

    // Admin quick actions
    const adminActions = [
        {
            icon: "👥",
            title: "Patients",
            description: "Manage patient records",
            path: "/patients"
        },
        {
            icon: "🩺",
            title: "Doctors",
            description: "Manage doctors",
            path: "/doctors"
        },
        {
            icon: "📅",
            title: "Appointments",
            description: "Manage appointments",
            path: "/appointments"
        },
        {
            icon: "💊",
            title: "Prescriptions",
            description: "Manage prescriptions",
            path: "/prescriptions"
        },
        {
            icon: "💰",
            title: "Billing",
            description: "Manage billing records",
            path: "/billing"
        },
        {
            icon: "🏢",
            title: "Departments",
            description: "Manage departments",
            path: "/departments"
        },
        {
            icon: "📊",
            title: "Reports",
            description: "View hospital reports",
            path: "/reports"
        }
    ];

    // Doctor quick actions
    const doctorActions = [
        {
            icon: "📅",
            title: "My Appointments",
            description: "View your appointments",
            path: "/appointments"
        },
        {
            icon: "💊",
            title: "Prescriptions",
            description: "Manage prescriptions",
            path: "/prescriptions"
        }
    ];

    // Patient quick actions
    const patientActions = [
        {
            icon: "👤",
            title: "My Profile",
            description: "View your profile",
            path: "/patients"
        },
        {
            icon: "📅",
            title: "My Appointments",
            description: "View your appointments",
            path: "/appointments"
        },
        {
            icon: "💊",
            title: "My Prescriptions",
            description: "View your prescriptions",
            path: "/prescriptions"
        },
        {
            icon: "💰",
            title: "My Billing",
            description: "View your billing records",
            path: "/billing"
        }
    ];

    const stats =
        role === "ADMIN"
            ? adminStats
            : role === "DOCTOR"
                ? doctorStats
                : patientStats;

    const actions =
        role === "ADMIN"
            ? adminActions
            : role === "DOCTOR"
                ? doctorActions
                : patientActions;

    const dashboardTitle =
        role === "ADMIN"
            ? "Hospital Overview"
            : role === "DOCTOR"
                ? "My Medical Overview"
                : "My Health Overview";

    const dashboardDescription =
        role === "ADMIN"
            ? "Summary of hospital activities"
            : role === "DOCTOR"
                ? "Your appointments and prescriptions"
                : "Your appointments and medical records";


    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const todayAppointments = appointments.filter(
        (a) => a.appointmentDate === today && a.status !== "CANCELLED"
    );

    const pendingAppointments = appointments.filter(
        (a) => a.status === "SCHEDULED"
    );

    const cancelledAppointments = appointments.filter(
        (a) => a.status === "CANCELLED"
    );

    const unpaidBills = billings.filter(
        (b) => b.status && b.status.toUpperCase() !== "PAID"
    );

    const notifications = [
        ...(todayAppointments.length > 0
            ? [`${todayAppointments.length} appointment(s) scheduled for today.`]
            : []),
        ...(pendingAppointments.length > 0
            ? [`${pendingAppointments.length} appointment(s) awaiting completion.`]
            : []),
        ...(cancelledAppointments.length > 0
            ? [`${cancelledAppointments.length} appointment(s) cancelled.`]
            : []),
        ...(role === "PATIENT" && unpaidBills.length > 0
            ? [`You have ${unpaidBills.length} unpaid bill(s).`]
            : [])
    ];



    return (
        <div className="dashboard-page">

            {/* Welcome banner */}
            <section className="dashboard-welcome">
                <div>
                    <span className="dashboard-eyebrow">
                        MEDCARE HOSPITAL
                    </span>

                    <h1>
                        Welcome back!
                    </h1>

                    <p>
                        {role === "ADMIN"
                            ? "Here's what's happening in your hospital today."
                            : role === "DOCTOR"
                                ? "Here is your medical activity overview."
                                : "Here is your personal health overview."}
                    </p>

                    <div className="dashboard-role">
                        Logged in as <strong>{role || "USER"}</strong>
                    </div>
                </div>

                <div className="dashboard-welcome-icon">
                    ✚
                </div>
            </section>

            {/* Loading */}
            {loading && (
                <div className="dashboard-message">
                    Loading dashboard information...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* Role-based statistics */}
            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>{dashboardTitle}</h2>
                        <p>{dashboardDescription}</p>
                    </div>
                </div>

                <div className="dashboard-stats-grid">
                    {stats.map(stat => (
                        <button
                            type="button"
                            className="dashboard-stat-card"
                            key={stat.title}
                            onClick={() => navigate(stat.path)}
                        >
                            <div className="dashboard-stat-info">
                                <span>{stat.title}</span>

                                <strong>
                                    {loading ? "—" : stat.count}
                                </strong>
                            </div>

                            <div
                                className={`dashboard-stat-icon ${stat.color}`}
                            >
                                {stat.icon}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Admin appointment analytics */}
            {role === "ADMIN" && (
                <section className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Appointment Analytics</h2>
                            <p>Appointment status overview</p>
                        </div>
                    </div>

                    <div className="dashboard-chart-card">
                        {!loading && (
                            <DashboardCharts
                                appointments={appointments}
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Recent Appointments */}
            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Recent Appointments</h2>
                        <p>Your latest appointment records</p>
                    </div>

                    <button
                        className="dashboard-view-all"
                        onClick={() => navigate("/appointments")}
                    >
                        View All →
                    </button>
                </div>

                <div className="dashboard-table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    No appointments found.
                                </td>
                            </tr>
                        ) : (
                            [...appointments]
                                .sort((a, b) =>
                                    `${b.appointmentDate || ""} ${b.appointmentTime || ""}`
                                        .localeCompare(
                                            `${a.appointmentDate || ""} ${a.appointmentTime || ""}`
                                        )
                                )
                                .slice(0, 5)
                                .map(appointment => (
                                    <tr key={appointment.id}>
                                        <td>#{appointment.id}</td>
                                        <td>
                                            {appointment.patient?.name || "N/A"}
                                        </td>
                                        <td>
                                            {appointment.doctor?.name || "N/A"}
                                        </td>
                                        <td>
                                            {appointment.appointmentDate || "N/A"}
                                        </td>
                                        <td>
                                            {appointment.appointmentTime || "N/A"}
                                        </td>
                                        <td>
                                    <span className={`appointment-status ${(appointment.status || "").toLowerCase()}`}>
                                        {appointment.status || "N/A"}
                                    </span>
                                        </td>
                                    </tr>
                                ))
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="dashboard-notifications">
                <h2>Alerts & Notifications</h2>

                {notifications.length > 0 ? (
                    notifications.map((message, index) => (
                        <div className="notification-item" key={index}>
                            <span>🔔</span>
                            <p>{message}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-notifications">
                        No new notifications.
                    </p>
                )}
            </div>



            {/* Quick actions */}
            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>
                            {role === "ADMIN"
                                ? "Quick Management"
                                : role === "DOCTOR"
                                    ? "Doctor Services"
                                    : "Patient Services"}
                        </h2>

                        <p>Choose a module to continue</p>
                    </div>
                </div>

                <div className="dashboard-actions-grid">
                    {actions.map(item => (
                        <button
                            type="button"
                            className="dashboard-action-card"
                            key={item.title}
                            onClick={() => navigate(item.path)}
                        >
                            <div className="dashboard-action-icon">
                                {item.icon}
                            </div>

                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>

                            <span className="dashboard-action-arrow">
                                →
                            </span>
                        </button>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default Dashboard;
