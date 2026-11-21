
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import "./Patients.css";

const emptyForm = {
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: ""
};

function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const token = localStorage.getItem("token");
    let role = "";

    try {
        if (token) {
            role = jwtDecode(token).role || "";
        }
    } catch (err) {
        console.error("Invalid token", err);
    }

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/patients");
            const data = response.data;

            setPatients(
                Array.isArray(data)
                    ? data
                    : data.content || data.data || []
            );
        } catch (err) {
            console.error(err);
            setError(
                err.response?.status === 403
                    ? "You are not allowed to access patients."
                    : "Failed to load patients."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
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

        const patientData = {
            ...form,
            age: Number(form.age)
        };

        try {
            setError("");

            if (editingId !== null) {
                await api.put(`/patients/${editingId}`, patientData);
                alert("Patient updated successfully");
            } else {
                await api.post("/patients", patientData);
                alert("Patient added successfully");
            }

            resetForm();
            await fetchPatients();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to save patient details."
            );
        }
    };

    const handleEdit = (patient) => {
        setEditingId(patient.id);
        setForm({
            name: patient.name || "",
            age: patient.age ?? "",
            gender: patient.gender || "",
            phone: patient.phone || "",
            email: patient.email || "",
            address: patient.address || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this patient?")) {
            return;
        }

        try {
            setError("");
            await api.delete(`/patients/${id}`);
            alert("Patient deleted successfully");
            await fetchPatients();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Failed to delete patient."
            );
        }
    };

    const filteredPatients = patients.filter(patient => {
        const text = search.toLowerCase();

        return (
            patient.name?.toLowerCase().includes(text) ||
            patient.email?.toLowerCase().includes(text) ||
            patient.phone?.toLowerCase().includes(text)
        );
    });

    return (
        <div className="patients-page">

            <div className="patients-heading">
                <div>
                    <span className="patients-eyebrow">MEDCARE / MANAGEMENT</span>
                    <h1>Patient Management</h1>
                    <p>Manage and monitor hospital patient records.</p>
                </div>

                {role === "ADMIN" && (
                    <button
                        className="patient-primary-btn"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        + Add New Patient
                    </button>
                )}
            </div>

            {error && (
                <div className="patient-error">
                    {error}
                </div>
            )}

            <div className="patient-summary">
                <div className="patient-summary-card">
                    <span>Total Patients</span>
                    <strong>{patients.length}</strong>
                    <div className="patient-summary-icon">👥</div>
                </div>

                <div className="patient-summary-card">
                    <span>Male Patients</span>
                    <strong>
                        {patients.filter(p =>
                            p.gender?.toLowerCase() === "male"
                        ).length}
                    </strong>
                    <div className="patient-summary-icon">👨</div>
                </div>

                <div className="patient-summary-card">
                    <span>Female Patients</span>
                    <strong>
                        {patients.filter(p =>
                            p.gender?.toLowerCase() === "female"
                        ).length}
                    </strong>
                    <div className="patient-summary-icon">👩</div>
                </div>
            </div>

            {showForm && role === "ADMIN" && (
                <div className="patient-form-card">
                    <div className="patient-form-heading">
                        <div>
                            <h2>{editingId !== null ? "Edit Patient" : "Register New Patient"}</h2>
                            <p>Enter the patient information below.</p>
                        </div>

                        <button
                            type="button"
                            className="patient-close-btn"
                            onClick={resetForm}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="patient-form-grid">

                            <div className="patient-field">
                                <label>Full Name *</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="patient-field">
                                <label>Age *</label>
                                <input
                                    name="age"
                                    type="number"
                                    min="0"
                                    value={form.age}
                                    onChange={handleChange}
                                    placeholder="Enter age"
                                    required
                                />
                            </div>

                            <div className="patient-field">
                                <label>Gender *</label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="patient-field">
                                <label>Phone Number</label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="patient-field">
                                <label>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="patient-field">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter patient address"
                                    rows="3"
                                />
                            </div>

                        </div>

                        <div className="patient-form-actions">
                            <button type="button" className="patient-cancel-btn" onClick={resetForm}>
                                Cancel
                            </button>

                            <button type="submit" className="patient-primary-btn">
                                {editingId !== null ? "Update Patient" : "Save Patient"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="patient-table-card">
                <div className="patient-table-heading">
                    <div>
                        <h2>Patient Records</h2>
                        <p>View and manage registered patients.</p>
                    </div>

                    <input
                        className="patient-search"
                        type="search"
                        placeholder="Search name, email or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="patient-empty">Loading patients...</div>
                ) : (
                    <div className="patient-table-scroll">
                        <table className="patient-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                {role === "ADMIN" && <th>Actions</th>}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={role === "ADMIN" ? 8 : 7} className="patient-empty">
                                        No patients found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map(patient => (
                                    <tr key={patient.id}>
                                        <td>#{patient.id}</td>
                                        <td>
                                            <div className="patient-name-cell">
                                                    <span className="patient-avatar">
                                                        {patient.name?.charAt(0)?.toUpperCase() || "P"}
                                                    </span>
                                                <strong>{patient.name}</strong>
                                            </div>
                                        </td>
                                        <td>{patient.age}</td>
                                        <td>
                                                <span className="patient-gender">
                                                    {patient.gender}
                                                </span>
                                        </td>
                                        <td>{patient.phone || "—"}</td>
                                        <td>{patient.email || "—"}</td>
                                        <td>{patient.address || "—"}</td>

                                        {role === "ADMIN" && (
                                            <td>
                                                <div className="patient-actions">
                                                    <button
                                                        className="patient-edit-btn"
                                                        onClick={() => handleEdit(patient)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="patient-delete-btn"
                                                        onClick={() => handleDelete(patient.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="patient-table-footer">
                    Showing {filteredPatients.length} of {patients.length} patients
                </div>
            </div>
        </div>
    );
}

export default Patients;
