import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    let role = "";

    try {
        const decodedToken = jwtDecode(token);
        role = decodedToken.role;
    } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
        return null;
    }

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav
            style={{
                padding: "15px",
                backgroundColor: "#1976d2",
                color: "white"
            }}
        >
            <strong style={{ fontSize: "20px" }}>
                Hospital Management System
            </strong>

            <span style={{ marginLeft: "30px" }}>
                Role: <strong>{role}</strong>
            </span>

            <button
                onClick={() => navigate("/dashboard")}
                style={{ marginLeft: "30px" }}
            >
                Dashboard
            </button>

            {role === "ADMIN" && (
                <>
                    <button onClick={() => navigate("/patients")}>
                        Patients
                    </button>

                    <button onClick={() => navigate("/doctors")}>
                        Doctors
                    </button>

                    <button onClick={() => navigate("/appointments")}>
                        Appointments
                    </button>

                    <button onClick={() => navigate("/prescriptions")}>
                        Prescriptions
                    </button>

                    <button onClick={() => navigate("/billing")}>
                        Billing
                    </button>
                </>
            )}

            {role === "DOCTOR" && (
                <>
                    <button onClick={() => navigate("/appointments")}>
                        My Appointments
                    </button>

                    <button onClick={() => navigate("/prescriptions")}>
                        Prescriptions
                    </button>
                </>
            )}

            {role === "PATIENT" && (
                <>
                    <button onClick={() => navigate("/patients")}>
                        My Profile
                    </button>

                    <button onClick={() => navigate("/appointments")}>
                        My Appointments
                    </button>

                    <button onClick={() => navigate("/prescriptions")}>
                        My Prescriptions
                    </button>

                    <button onClick={() => navigate("/billing")}>
                        My Billing
                    </button>
                </>
            )}

            <button
                onClick={logout}
                style={{ marginLeft: "20px" }}
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;