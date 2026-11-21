
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");

    let role = "";

    try {
        if (token) {
            const decodedToken = jwtDecode(token);
            role = decodedToken.role || "";
        }
    } catch (error) {
        console.error("Invalid token", error);
    }

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const menus = {
        ADMIN: [
            { icon: "📊", label: "Dashboard", path: "/dashboard" },
            { icon: "👥", label: "Patients", path: "/patients" },
            { icon: "🩺", label: "Doctors", path: "/doctors" },
            { icon: "📅", label: "Appointments", path: "/appointments" },
            { icon: "💊", label: "Prescriptions", path: "/prescriptions" },
            { icon: "💰", label: "Billing", path: "/billing" },
            { icon: "🏢", label: "Departments", path: "/departments" },
            { icon: "📈", label: "Reports", path: "/reports" }
        ],
        DOCTOR: [
            { icon: "📊", label: "Dashboard", path: "/dashboard" },
            { icon: "📅", label: "My Appointments", path: "/appointments" },
            { icon: "💊", label: "Prescriptions", path: "/prescriptions" }
        ],
        PATIENT: [
            { icon: "📊", label: "Dashboard", path: "/dashboard" },
            { icon: "👤", label: "My Profile", path: "/patients" },
            { icon: "📅", label: "My Appointments", path: "/appointments" },
            { icon: "💊", label: "My Prescriptions", path: "/prescriptions" },
            { icon: "💰", label: "My Billing", path: "/billing" }
        ]
    };

    const menuItems = menus[role] || [];

    return (
        <div className="hms-layout">

            {/* SIDEBAR */}
            <aside className="hms-sidebar">

                <div className="hms-brand">
                    <div className="hms-brand-icon">✚</div>
                    <div>
                        <h2>MedCare</h2>
                        <span>Hospital Management</span>
                    </div>
                </div>

                <div className="hms-sidebar-user">
                    <div className="hms-user-avatar">
                        {role.charAt(0) || "U"}
                    </div>
                    <div>
                        <strong>{role || "USER"}</strong>
                        <span>Account</span>
                    </div>
                </div>

                <p className="hms-menu-heading">MAIN MENU</p>

                <nav className="hms-navigation">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            className={`hms-menu-button ${
                                location.pathname === item.path ? "active" : ""
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="hms-menu-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="hms-sidebar-bottom">
                    <button
                        type="button"
                        className="hms-logout-button"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </div>

            </aside>

            {/* MAIN CONTENT */}
            <div className="hms-main">

                <header className="hms-topbar">
                    <div>
                        <h2>Hospital Management System</h2>
                        <p>Welcome to your hospital dashboard</p>
                    </div>

                    <div className="hms-topbar-profile">
                        <div className="hms-topbar-avatar">
                            {role.charAt(0) || "U"}
                        </div>
                        <div>
                            <strong>{role || "USER"}</strong>
                            <span>Logged in</span>
                        </div>
                    </div>
                </header>

                <main className="hms-content">
                    {children}
                </main>

                <footer className="hms-footer">
                    © 2026 MedCare Hospital Management System
                </footer>

            </div>
        </div>
    );
}

export default Layout;
