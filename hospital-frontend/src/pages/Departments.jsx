
import { useEffect, useState } from "react";
import api from "../services/api";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [editId, setEditId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/departments");

            setDepartments(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.content || response.data.data || []
            );
        } catch (error) {
            console.error(error);
            setError("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Please enter department name");
            return;
        }

        const departmentData = {
            name: name.trim(),
            description: description.trim()
        };

        try {
            if (isEditing) {
                await api.put(`/departments/${editId}`, departmentData);
                alert("Department updated successfully!");
            } else {
                await api.post("/departments", departmentData);
                alert("Department added successfully!");
            }

            setName("");
            setDescription("");
            setEditId(null);
            setIsEditing(false);

            fetchDepartments();

        } catch (error) {
            console.error(error);
            alert("Failed to save department.");
        }
    };
    const handleEditDepartment = (department) => {
        setEditId(department.id);
        setName(department.name);
        setDescription(department.description || "");
        setIsEditing(true);
    };
    const handleDeleteDepartment = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this department?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await api.delete(`/departments/${id}`);

            alert("Department deleted successfully!");

            fetchDepartments();

        } catch (error) {
            console.error(error);
            alert("Failed to delete department.");
        }
    };
    const filteredDepartments = departments.filter((department) =>
        department.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>Department Management</h1>
            <p>Manage hospital departments</p>
            <hr />

            <h2>Add Department</h2>

            <form onSubmit={handleAddDepartment}>
                <div style={{ marginBottom: "15px" }}>
                    <label>Department Name</label>
                    <br />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter department name"
                        required
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Description</label>
                    <br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter department description"
                        rows="3"
                    />
                </div>

                <button type="submit">
                    {isEditing ? "Update Department" : "Add Department"}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={() => {
                            setName("");
                            setDescription("");
                            setEditId(null);
                            setIsEditing(false);
                        }}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <hr />

            <h2>Department List</h2>
            <input
                type="text"
                placeholder="Search department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    padding: "10px",
                    width: "250px",
                    marginBottom: "15px"
                }}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            {loading ? (
                <p>Loading departments...</p>
            ) : filteredDepartments.length === 0 ? (
                <p>No departments found.</p>
            ) :

                (
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}>
                    <thead>

                    <tr>
                        <th>ID</th>
                        <th>Department Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredDepartments.map((department) => (
                        <tr key={department.id}>
                            <td>{department.id}</td>
                            <td>{department.name}</td>
                            <td>{department.description}</td>

                            <td>
                                <button onClick={() => handleEditDepartment(department)} style={{
                                    marginLeft: "10px",
                                    backgroundColor: "blue",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    cursor: "pointer"
                                }}>
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDeleteDepartment(department.id)}
                                    style={{
                                        marginLeft: "10px",
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        padding: "6px 12px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Departments;
