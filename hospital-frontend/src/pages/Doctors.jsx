
import { useEffect, useState } from "react";
import api from "../services/api";

function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        name: "",
        specialization: "",
        phone: "",
        email: "",
        departmentId: ""
    };

    const [form, setForm] = useState(emptyForm);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/doctors");
            const data = response.data;

            setDoctors(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                        ? data.content
                        : []
            );
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error || "Failed to load doctors."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const getDoctorPayload = () => ({
        name: form.name,
        specialization: form.specialization,
        phone: form.phone,
        email: form.email,
        department: form.departmentId
            ? { id: Number(form.departmentId) }
            : null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            if (editingId) {
                await api.put(
                    `/doctors/${editingId}`,
                    getDoctorPayload()
                );
                alert("Doctor updated successfully!");
            } else {
                await api.post("/doctors", getDoctorPayload());
                alert("Doctor added successfully!");
            }

            resetForm();
            await fetchDoctors();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Unable to save doctor details."
            );
        }
    };

    const handleEdit = (doctor) => {
        setEditingId(doctor.id);

        setForm({
            name: doctor.name || "",
            specialization: doctor.specialization || "",
            phone: doctor.phone || "",
            email: doctor.email || "",
            departmentId: doctor.department?.id || ""
        });

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) {
            return;
        }

        try {
            setError("");
            await api.delete(`/doctors/${id}`);
            alert("Doctor deleted successfully!");
            await fetchDoctors();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Failed to delete doctor."
            );
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const text = search.toLowerCase();

        return (
            doctor.name?.toLowerCase().includes(text) ||
            doctor.email?.toLowerCase().includes(text) ||
            doctor.phone?.toLowerCase().includes(text) ||
            doctor.specialization?.toLowerCase().includes(text) ||
            doctor.department?.name?.toLowerCase().includes(text)
        );
    });

    const inputStyle = {
        width: "100%",
        padding: "12px 14px",
        border: "1px solid #dce3ed",
        borderRadius: "8px",
        outline: "none",
        marginTop: "7px",
        background: "#fff"
    };

    const labelStyle = {
        fontSize: "13px",
        fontWeight: "600",
        color: "#34445c"
    };

    const primaryButton = {
        background: "#1687e8",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "11px 19px",
        fontWeight: "600",
        cursor: "pointer"
    };

    const editButton = {
        background: "#e8f2ff",
        color: "#1672c4",
        border: "none",
        padding: "8px 13px",
        borderRadius: "6px",
        cursor: "pointer",
        marginRight: "7px"
    };

    const deleteButton = {
        background: "#fff0f0",
        color: "#dc3545",
        border: "none",
        padding: "8px 13px",
        borderRadius: "6px",
        cursor: "pointer"
    };

    const cardStyle = {
        background: "#fff",
        border: "1px solid #e8edf4",
        borderRadius: "12px",
        padding: "22px",
        boxShadow: "0 3px 12px rgba(25, 50, 80, 0.04)"
    };

    return (
        <div className="doctors-page">

            {/* PAGE HEADER */}
            <div className="doctors-page-header">
                <div>
                    <h1>Doctor Management</h1>
                    <p>Manage hospital doctors and their information</p>
                </div>

                <button
                    style={primaryButton}
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    + Add New Doctor
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="doctor-error">
                    {error}
                </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="doctor-summary-grid">
                <div style={cardStyle}>
                    <div className="doctor-summary-icon blue">🩺</div>
                    <p>Total Doctors</p>
                    <h2>{doctors.length}</h2>
                </div>

                <div style={cardStyle}>
                    <div className="doctor-summary-icon green">👨‍⚕️</div>
                    <p>Specializations</p>
                    <h2>
                        {new Set(
                            doctors
                                .map(d => d.specialization)
                                .filter(Boolean)
                        ).size}
                    </h2>
                </div>

                <div style={cardStyle}>
                    <div className="doctor-summary-icon purple">🏢</div>
                    <p>Assigned Doctors</p>
                    <h2>
                        {doctors.filter(d => d.department?.id).length}
                    </h2>
                </div>
            </div>

            {/* ADD / EDIT FORM */}
            {showForm && (
                <div className="doctor-form-card">
                    <div className="doctor-form-heading">
                        <div>
                            <h2>
                                {editingId ? "Edit Doctor" : "Register New Doctor"}
                            </h2>
                            <p>Enter the doctor information below</p>
                        </div>

                        <button
                            className="doctor-close-button"
                            onClick={resetForm}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="doctor-form-grid">

                            <label style={labelStyle}>
                                Doctor Name *
                                <input
                                    style={inputStyle}
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter doctor name"
                                    required
                                />
                            </label>

                            <label style={labelStyle}>
                                Specialization
                                <input
                                    style={inputStyle}
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g. Cardiologist"
                                />
                            </label>

                            <label style={labelStyle}>
                                Phone Number
                                <input
                                    style={inputStyle}
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </label>

                            <label style={labelStyle}>
                                Email Address
                                <input
                                    style={inputStyle}
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="doctor@example.com"
                                />
                            </label>

                            <label style={labelStyle}>
                                Department ID
                                <input
                                    style={inputStyle}
                                    type="number"
                                    min="1"
                                    name="departmentId"
                                    value={form.departmentId}
                                    onChange={handleChange}
                                    placeholder="Enter department ID"
                                />
                            </label>

                        </div>

                        <div className="doctor-form-actions">
                            <button type="submit" style={primaryButton}>
                                {editingId ? "Update Doctor" : "Save Doctor"}
                            </button>

                            <button
                                type="button"
                                className="doctor-cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* DOCTOR DIRECTORY */}
            <div className="doctor-directory" style={cardStyle}>

                <div className="doctor-directory-header">
                    <div>
                        <h2>Doctor Directory</h2>
                        <p>View and manage registered doctors</p>
                    </div>

                    <input
                        className="doctor-search"
                        type="text"
                        placeholder="Search name, email, specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="doctor-message">Loading doctors...</p>
                ) : (
                    <div className="doctor-table-wrapper">
                        <table className="doctor-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Doctor</th>
                                <th>Specialization</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="doctor-message">
                                        No doctors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>#{doctor.id}</td>

                                        <td>
                                            <div className="doctor-name-cell">
                                                <div className="doctor-avatar">
                                                    {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                                                </div>
                                                <strong>{doctor.name}</strong>
                                            </div>
                                        </td>

                                        <td>
                                                <span className="doctor-specialization">
                                                    {doctor.specialization || "Not specified"}
                                                </span>
                                        </td>

                                        <td>{doctor.phone || "-"}</td>
                                        <td>{doctor.email || "-"}</td>

                                        <td>
                                            {doctor.department?.name || "Not assigned"}
                                        </td>

                                        <td>
                                            <div className="doctor-action-buttons">
                                                <button
                                                    style={editButton}
                                                    onClick={() => handleEdit(doctor)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    style={deleteButton}
                                                    onClick={() => handleDelete(doctor.id)}
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

                <div className="doctor-table-footer">
                    Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
            </div>

        </div>
    );
}

export default Doctors;
