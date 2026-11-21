
import { useEffect, useState } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const emptyForm = {
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    status: "SCHEDULED"
};

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    let role = "";

    try {
        const token = localStorage.getItem("token");
        if (token) role = jwtDecode(token).role || "";
    } catch (error) {
        console.error("Invalid token", error);
    }

    const getList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.content)) return data.content;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    const fetchAppointments = async () => {
        const response = await api.get("/appointments");
        setAppointments(getList(response.data));
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get("/patients");
            setPatients(getList(response.data));
        } catch (error) {
            console.error("Patients loading error", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get("/doctors");
            setDoctors(getList(response.data));
        } catch (error) {
            console.error("Doctors loading error", error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            await Promise.all([
                fetchAppointments(),
                fetchPatients(),
                fetchDoctors()
            ]);
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.error ||
                "Failed to load appointments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = {
                patient: { id: Number(form.patientId) },
                doctor: { id: Number(form.doctorId) },
                appointmentDate: form.appointmentDate,
                appointmentTime: form.appointmentTime,
                reason: form.reason,
                status: form.status
            };

            const updateData = {
                ...data,
                patient: data.patient,
                doctor: data.doctor
            };

            if (editingId) {
                if (role !== "ADMIN") {
                    delete updateData.patient;
                    delete updateData.doctor;
                }

                await api.put(`/appointments/${editingId}`, updateData);
                alert("Appointment updated successfully!");
            } else {
                await api.post("/appointments", data);
                alert("Appointment created successfully!");
            }

            resetForm();
            await fetchAppointments();
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.error ||
                "Failed to save appointment."
            );
        }
    };

    const handleEdit = (appointment) => {
        setEditingId(appointment.id);
        setForm({
            patientId: appointment.patient?.id || "",
            doctorId: appointment.doctor?.id || "",
            appointmentDate: appointment.appointmentDate || "",
            appointmentTime: appointment.appointmentTime || "",
            reason: appointment.reason || "",
            status: appointment.status || "SCHEDULED"
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this appointment?")) return;

        try {
            setError("");
            await api.delete(`/appointments/${id}`);
            alert("Appointment deleted successfully!");
            await fetchAppointments();
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.error ||
                "Failed to delete appointment."
            );
        }
    };

    const handleStatusChange = async (appointment, newStatus) => {
        try {
            const data = {
                patient: { id: appointment.patient?.id },
                doctor: { id: appointment.doctor?.id },
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                reason: appointment.reason,
                status: newStatus
            };

            await api.put(`/appointments/${appointment.id}`, data);
            await fetchAppointments();
        } catch (error) {
            console.error(error);
            setError(
                error.response?.data?.error ||
                "Failed to update appointment status."
            );
        }
    };

    const filteredAppointments = appointments.filter((a) => {
        const text = search.toLowerCase();

        const matchesSearch =
            String(a.id).includes(text) ||
            a.patient?.name?.toLowerCase().includes(text) ||
            a.doctor?.name?.toLowerCase().includes(text) ||
            a.reason?.toLowerCase().includes(text);

        const matchesStatus =
            statusFilter === "ALL" || a.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const countStatus = (status) =>
        appointments.filter(a => a.status === status).length;

    const inputStyle = {
        width: "100%",
        padding: "12px",
        border: "1px solid #dce3ed",
        borderRadius: "8px",
        marginTop: "7px",
        background: "white"
    };

    const primaryButton = {
        background: "#1677d2",
        color: "white",
        border: "none",
        padding: "12px 18px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    };

    const statusClass = (status) => {
        return `appointment-status ${status?.toLowerCase()}`;
    };

    return (
        <div className="appointments-page">

            <div className="appointment-page-header">
                <div>
                    <h1>Appointment Management</h1>
                    <p>Schedule and manage hospital appointments</p>
                </div>

                <button
                    style={primaryButton}
                    onClick={() => {
                        setForm(emptyForm);
                        setEditingId(null);
                        setShowForm(true);
                    }}
                >
                    + New Appointment
                </button>
            </div>

            {error && (
                <div className="appointment-error">{error}</div>
            )}

            <div className="appointment-stats">
                <div className="appointment-stat-card">
                    <span>📅</span>
                    <p>Total Appointments</p>
                    <h2>{appointments.length}</h2>
                </div>
                <div className="appointment-stat-card">
                    <span>🕒</span>
                    <p>Scheduled</p>
                    <h2>{countStatus("SCHEDULED")}</h2>
                </div>
                <div className="appointment-stat-card">
                    <span>✅</span>
                    <p>Confirmed</p>
                    <h2>{countStatus("CONFIRMED")}</h2>
                </div>
                <div className="appointment-stat-card">
                    <span>✔️</span>
                    <p>Completed</p>
                    <h2>{countStatus("COMPLETED")}</h2>
                </div>
                <div className="appointment-stat-card">
                    <span>❌</span>
                    <p>Cancelled</p>
                    <h2>{countStatus("CANCELLED")}</h2>
                </div>
            </div>

            {showForm && (
                <div className="appointment-form-card">
                    <div className="appointment-form-heading">
                        <div>
                            <h2>
                                {editingId ? "Edit Appointment" : "Book New Appointment"}
                            </h2>
                            <p>Enter the appointment details</p>
                        </div>
                        <button
                            type="button"
                            className="appointment-close"
                            onClick={resetForm}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="appointment-form-grid">

                            {role === "ADMIN" && (
                                <label>
                                    Patient *
                                    <select
                                        name="patientId"
                                        value={form.patientId}
                                        onChange={handleChange}
                                        style={inputStyle}
                                        required
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - ID {p.id}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            {role === "PATIENT" && !editingId && (
                                <div className="appointment-patient-note">
                                    Your appointment will be associated with your patient profile.
                                </div>
                            )}

                            {(!editingId || role === "ADMIN") && (
                                <label>
                                    Doctor *
                                    <select
                                        name="doctorId"
                                        value={form.doctorId}
                                        onChange={handleChange}
                                        style={inputStyle}
                                        required
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} - ID {d.id}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            <label>
                                Appointment Date *
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={form.appointmentDate}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                            </label>

                            <label>
                                Appointment Time *
                                <input
                                    type="time"
                                    name="appointmentTime"
                                    value={form.appointmentTime}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                            </label>

                            <label>
                                Appointment Status
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </label>

                            <label className="appointment-reason">
                                Reason for Appointment *
                                <textarea
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter reason..."
                                    style={inputStyle}
                                    required
                                />
                            </label>
                        </div>

                        <div className="appointment-form-actions">
                            <button type="submit" style={primaryButton}>
                                {editingId ? "Update Appointment" : "Save Appointment"}
                            </button>
                            <button
                                type="button"
                                className="appointment-cancel"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="appointment-directory">
                <div className="appointment-directory-header">
                    <div>
                        <h2>Appointment Records</h2>
                        <p>View and manage scheduled appointments</p>
                    </div>

                    <div className="appointment-filters">
                        <input
                            type="text"
                            placeholder="Search patient, doctor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="appointment-empty">Loading appointments...</p>
                ) : (
                    <div className="appointment-table-wrapper">
                        <table className="appointment-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="appointment-empty">
                                        No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map(a => (
                                    <tr key={a.id}>
                                        <td>#{a.id}</td>
                                        <td><strong>{a.patient?.name || "-"}</strong></td>
                                        <td>{a.doctor?.name || "-"}</td>
                                        <td>{a.appointmentDate}</td>
                                        <td>{a.appointmentTime}</td>
                                        <td>{a.reason || "-"}</td>
                                        <td>
                                            {["ADMIN", "DOCTOR"].includes(role) ? (
                                                <select
                                                    className={statusClass(a.status)}
                                                    value={a.status || "SCHEDULED"}
                                                    onChange={e =>
                                                        handleStatusChange(a, e.target.value)
                                                    }
                                                >
                                                    <option value="SCHEDULED">Scheduled</option>
                                                    <option value="CONFIRMED">Confirmed</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            ) : (
                                                <span className={statusClass(a.status)}>
                                                        {a.status}
                                                    </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="appointment-actions">
                                                <button
                                                    className="appointment-edit"
                                                    onClick={() => handleEdit(a)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="appointment-delete"
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="appointment-table-footer">
                    Showing {filteredAppointments.length} of {appointments.length} appointments
                </p>
            </div>
        </div>
    );
}

export default Appointments;
