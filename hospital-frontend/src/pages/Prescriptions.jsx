
import { useEffect, useState } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import "./Prescriptions.css";

function Prescriptions() {
    const token = localStorage.getItem("token");

    let role = "";

    try {
        role = jwtDecode(token).role;
    } catch {
        console.error("Invalid token");
    }

    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        patientId: "",
        doctorId: "",
        appointmentId: "",
        medicineName: "",
        dosage: "",
        instructions: ""
    };

    const [form, setForm] = useState(emptyForm);

    const fetchPrescriptions = async () => {
        try {
            const response = await api.get("/prescriptions");
            setPrescriptions(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to load prescriptions"
            );
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get("/patients");
            setPatients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Patients loading failed", error);
        }
    };

    const fetchDoctors = async () => {
        if (role !== "ADMIN") return;

        try {
            const response = await api.get("/doctors");
            setDoctors(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Doctors loading failed", error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await api.get("/appointments");
            setAppointments(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error("Appointments loading failed", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchPrescriptions(),
                fetchPatients(),
                fetchDoctors(),
                fetchAppointments()
            ]);
            setLoading(false);
        };

        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
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
                appointment: { id: Number(form.appointmentId) },
                medicineName: form.medicineName.trim(),
                dosage: form.dosage.trim(),
                instructions: form.instructions.trim()
            };

            if (editingId) {
                await api.put(`/prescriptions/${editingId}`, data);
                alert("Prescription updated successfully");
            } else {
                await api.post("/prescriptions", data);
                alert("Prescription added successfully");
            }

            resetForm();
            await fetchPrescriptions();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to save prescription"
            );
        }
    };

    const handleEdit = (prescription) => {
        setEditingId(prescription.id);

        setForm({
            patientId: prescription.patient?.id || "",
            doctorId: prescription.doctor?.id || "",
            appointmentId: prescription.appointment?.id || "",
            medicineName: prescription.medicineName || "",
            dosage: prescription.dosage || "",
            instructions: prescription.instructions || ""
        });

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this prescription?")) {
            return;
        }

        try {
            await api.delete(`/prescriptions/${id}`);
            alert("Prescription deleted successfully");
            await fetchPrescriptions();
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Failed to delete prescription"
            );
        }
    };

    const filteredPrescriptions = prescriptions.filter((item) => {
        const keyword = search.toLowerCase();

        return (
            String(item.id).includes(keyword) ||
            item.patient?.name?.toLowerCase().includes(keyword) ||
            item.doctor?.name?.toLowerCase().includes(keyword) ||
            item.medicineName?.toLowerCase().includes(keyword)
        );
    });

    if (loading) {
        return (
            <div className="prescription-loading">
                Loading prescriptions...
            </div>
        );
    }

    return (
        <div className="prescriptions-page">

            <div className="prescription-header">
                <div>
                    <span className="page-eyebrow">HOSPITAL MANAGEMENT</span>
                    <h1>Prescriptions</h1>
                    <p>Manage patient medicines and treatment instructions.</p>
                </div>

                {(role === "ADMIN" || role === "DOCTOR") && (
                    <button
                        className="prescription-primary-btn"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        + New Prescription
                    </button>
                )}
            </div>

            {error && (
                <div className="prescription-error">
                    {error}
                </div>
            )}

            <div className="prescription-stats">
                <div className="prescription-stat-card">
                    <span>Total Prescriptions</span>
                    <h2>{prescriptions.length}</h2>
                </div>

                <div className="prescription-stat-card">
                    <span>Patients Prescribed</span>
                    <h2>
                        {new Set(
                            prescriptions.map((p) => p.patient?.id).filter(Boolean)
                        ).size}
                    </h2>
                </div>

                <div className="prescription-stat-card">
                    <span>Medicines Prescribed</span>
                    <h2>
                        {new Set(
                            prescriptions.map((p) => p.medicineName).filter(Boolean)
                        ).size}
                    </h2>
                </div>
            </div>

            {showForm && (
                <div className="prescription-form-card">
                    <div className="prescription-form-heading">
                        <div>
                            <h2>
                                {editingId ? "Edit Prescription" : "Create Prescription"}
                            </h2>
                            <p>Enter the patient and medicine details below.</p>
                        </div>

                        <button
                            type="button"
                            className="prescription-close-btn"
                            onClick={resetForm}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="prescription-form-grid">

                            <div className="prescription-field">
                                <label>Patient</label>
                                <select
                                    name="patientId"
                                    value={form.patientId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} - ID {patient.id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="prescription-field">
                                <label>Doctor ID</label>

                                {role === "ADMIN" ? (
                                    <select
                                        name="doctorId"
                                        value={form.doctorId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.name} - ID {doctor.id}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        name="doctorId"
                                        value={form.doctorId}
                                        onChange={handleChange}
                                        placeholder="Enter Doctor ID"
                                        required
                                    />
                                )}
                            </div>

                            <div className="prescription-field">
                                <label>Appointment</label>
                                <select
                                    name="appointmentId"
                                    value={form.appointmentId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Appointment</option>
                                    {appointments.map((appointment) => (
                                        <option key={appointment.id} value={appointment.id}>
                                            Appointment #{appointment.id} - {appointment.appointmentDate}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="prescription-field">
                                <label>Medicine Name</label>
                                <input
                                    type="text"
                                    name="medicineName"
                                    value={form.medicineName}
                                    onChange={handleChange}
                                    placeholder="Enter medicine name"
                                    required
                                />
                            </div>

                            <div className="prescription-field">
                                <label>Dosage</label>
                                <input
                                    type="text"
                                    name="dosage"
                                    value={form.dosage}
                                    onChange={handleChange}
                                    placeholder="Example: 500mg twice daily"
                                    required
                                />
                            </div>

                            <div className="prescription-field prescription-full-width">
                                <label>Instructions</label>
                                <textarea
                                    name="instructions"
                                    value={form.instructions}
                                    onChange={handleChange}
                                    placeholder="Enter medicine instructions"
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="prescription-form-actions">
                            <button type="button" className="prescription-cancel-btn" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="prescription-primary-btn">
                                {editingId ? "Update Prescription" : "Save Prescription"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="prescription-table-card">
                <div className="prescription-table-header">
                    <div>
                        <h2>Prescription Records</h2>
                        <p>View and manage hospital prescriptions.</p>
                    </div>

                    <input
                        className="prescription-search"
                        type="search"
                        placeholder="Search patient, doctor or medicine..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="prescription-table-wrapper">
                    <table className="prescription-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Appointment</th>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Instructions</th>
                            {(role === "ADMIN" || role === "DOCTOR") && <th>Actions</th>}
                        </tr>
                        </thead>

                        <tbody>
                        {filteredPrescriptions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="prescription-empty">
                                    No prescriptions found.
                                </td>
                            </tr>
                        ) : (
                            filteredPrescriptions.map((item) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>{item.patient?.name || "-"}</td>
                                    <td>{item.doctor?.name || "-"}</td>
                                    <td>#{item.appointment?.id || "-"}</td>
                                    <td className="medicine-name">{item.medicineName || "-"}</td>
                                    <td>{item.dosage || "-"}</td>
                                    <td>{item.instructions || "-"}</td>

                                    {(role === "ADMIN" || role === "DOCTOR") && (
                                        <td>
                                            <div className="prescription-actions">
                                                <button
                                                    className="prescription-edit-btn"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </button>

                                                {role === "ADMIN" && (
                                                    <button
                                                        className="prescription-delete-btn"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="prescription-table-footer">
                    Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </div>
            </div>
        </div>
    );
}

export default Prescriptions;
