
import { useEffect, useState } from "react";
import api from "../services/api";

function Billing() {
    const [billings, setBillings] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);

    const [form, setForm] = useState({
        appointmentId: "",
        paymentDate: "",
        consultationFee: "",
        medicineFee: "",
        roomFee: "",
        status: "PENDING"
    });

    const totalAmount =
        Number(form.consultationFee || 0) +
        Number(form.medicineFee || 0) +
        Number(form.roomFee || 0);

    useEffect(() => {
        fetchBillings();
        fetchAppointments();
    }, []);

    const fetchBillings = async () => {
        try {
            const response = await api.get("/billings");
            setBillings(response.data);
            setError("");
        } catch (err) {
            setError("Unable to load billing records.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await api.get("/appointments");
            setAppointments(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setForm({
            appointmentId: "",
            paymentDate: "",
            consultationFee: "",
            medicineFee: "",
            roomFee: "",
            status: "PENDING"
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const billingData = {
            appointment: { id: Number(form.appointmentId) },
            paymentDate: form.paymentDate,
            consultationFee: Number(form.consultationFee),
            medicineFee: Number(form.medicineFee),
            roomFee: Number(form.roomFee),
            status: form.status
        };

        try {
            if (editingId) {
                await api.put(`/billings/${editingId}`, billingData);
                alert("Bill updated successfully!");
            } else {
                await api.post("/billings", billingData);
                alert("Bill added successfully!");
            }

            resetForm();
            fetchBillings();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to save bill."
            );
        }
    };

    const handleEdit = (bill) => {
        setEditingId(bill.id);

        setForm({
            appointmentId: bill.appointment?.id || "",
            paymentDate: bill.paymentDate || "",
            consultationFee: bill.consultationFee ?? "",
            medicineFee: bill.medicineFee ?? "",
            roomFee: bill.roomFee ?? "",
            status: bill.status || "PENDING"
        });

        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this bill?")) return;

        try {
            await api.delete(`/billings/${id}`);
            alert("Bill deleted successfully!");
            fetchBillings();
        } catch (err) {
            alert("Unable to delete bill.");
        }
    };

    const handlePrint = () => {
        if (!selectedBill) return;
        window.print();
    };

    const filteredBillings = billings.filter((bill) => {
        const patientName =
            bill.appointment?.patient?.name?.toLowerCase() || "";

        return (
            patientName.includes(search.toLowerCase()) ||
            String(bill.id).includes(search)
        );
    });

    const paidBills = billings.filter(
        (bill) => bill.status === "PAID"
    );

    const pendingBills = billings.filter(
        (bill) => bill.status === "PENDING"
    );

    const sumBills = (items) =>
        items.reduce(
            (sum, bill) => sum + Number(bill.totalAmount || 0),
            0
        );

    const cardStyle = {
        background: "white",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        flex: 1,
        minWidth: "180px"
    };

    const inputStyle = {
        width: "100%",
        padding: "11px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        marginTop: "6px",
        boxSizing: "border-box"
    };

    const buttonStyle = {
        padding: "10px 15px",
        border: "none",
        borderRadius: "7px",
        cursor: "pointer",
        fontWeight: "600"
    };

    return (
        <div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    width: "100%",
                    marginBottom: "20px"
                }}
            >

                <div>

                        <h1>Billing Management</h1>
                        <p>
                            Manage hospital bills and payments
                        </p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    style={{
                        ...buttonStyle,
                        background: "#2563eb",
                        color: "white",
                        flexShrink: 0
                    }}
                >
                    + Create New Bill
                </button>
            </div>

            {/* SUMMARY */}

            <div className="no-print" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
                gap: "18px",
                width: "100%",
                marginBottom: "25px"
            }}>
                <div style={cardStyle}>
                    <p>Total Bills</p>
                    <h2 style={{ color: "#2563eb" }}>
                        {billings.length}
                    </h2>
                    <p>₹{sumBills(billings).toFixed(2)}</p>
                </div>

                <div style={cardStyle}>
                    <p>Paid Bills</p>
                    <h2 style={{ color: "#16a34a" }}>
                        {paidBills.length}
                    </h2>
                    <p>₹{sumBills(paidBills).toFixed(2)}</p>
                </div>

                <div style={cardStyle}>
                    <p>Pending Bills</p>
                    <h2 style={{ color: "#ea580c" }}>
                        {pendingBills.length}
                    </h2>
                    <p>₹{sumBills(pendingBills).toFixed(2)}</p>
                </div>
            </div>

            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="no-print" style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    marginBottom: "25px"
                }}>
                    <h2>{editingId ? "Edit Bill" : "Create New Bill"}</h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "18px"
                        }}>
                            <label>
                                Appointment
                                <select
                                    name="appointmentId"
                                    value={form.appointmentId}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">Select Appointment</option>
                                    {appointments.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            Appointment #{a.id} - {a.patient?.name || "Patient"}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Payment Date
                                <input
                                    type="date"
                                    name="paymentDate"
                                    value={form.paymentDate}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </label>

                            <label>
                                Consultation Fee (₹)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="consultationFee"
                                    value={form.consultationFee}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </label>

                            <label>
                                Medicine Fee (₹)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="medicineFee"
                                    value={form.medicineFee}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </label>

                            <label>
                                Room Fee (₹)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="roomFee"
                                    value={form.roomFee}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </label>

                            <label>
                                Payment Status
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PAID">PAID</option>
                                </select>
                            </label>
                        </div>

                        <h2 style={{ color: "#2563eb", marginTop: "20px" }}>
                            Total: ₹{totalAmount.toFixed(2)}
                        </h2>

                        <button
                            type="submit"
                            style={{
                                ...buttonStyle,
                                background: "#2563eb",
                                color: "white"
                            }}
                        >
                            {editingId ? "Update Bill" : "Save Bill"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            style={{
                                ...buttonStyle,
                                background: "#e2e8f0",
                                marginLeft: "10px"
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {/* BILLING TABLE */}

            <div className="no-print" style={{
                background: "white",
                padding: "22px",
                borderRadius: "12px"
            }}>
                <h2>Billing Records</h2>

                <input
                    placeholder="Search patient or bill ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...inputStyle, maxWidth: "300px", marginBottom: "20px" }}
                />

                {loading ? (
                    <p>Loading bills...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: "900px"
                        }}>
                            <thead>
                            <tr style={{ background: "#eff6ff" }}>
                                {["ID", "Patient", "Date", "Total", "Status", "Actions"].map((heading) => (
                                    <th key={heading} style={cellStyle}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {filteredBillings.map((bill) => (
                                <tr key={bill.id}>
                                    <td style={cellStyle}>#{bill.id}</td>
                                    <td style={cellStyle}>
                                        {bill.appointment?.patient?.name || "N/A"}
                                    </td>
                                    <td style={cellStyle}>{bill.paymentDate}</td>
                                    <td style={cellStyle}>
                                        ₹{Number(bill.totalAmount || 0).toFixed(2)}
                                    </td>
                                    <td style={cellStyle}>
                                        {bill.status}
                                    </td>
                                    <td style={cellStyle}>
                                        <button
                                            onClick={() => setSelectedBill(bill)}
                                            style={{
                                                ...buttonStyle,
                                                background: "#dbeafe",
                                                color: "#1d4ed8"
                                            }}
                                        >
                                            View Invoice
                                        </button>

                                        <button
                                            onClick={() => handleEdit(bill)}
                                            style={{
                                                ...buttonStyle,
                                                background: "#fef3c7",
                                                marginLeft: "5px"
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(bill.id)}
                                            style={{
                                                ...buttonStyle,
                                                background: "#fee2e2",
                                                color: "#dc2626",
                                                marginLeft: "5px"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredBillings.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{
                                        ...cellStyle,
                                        textAlign: "center"
                                    }}>
                                        No billing records found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PROFESSIONAL INVOICE */}

            {selectedBill && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(15,23,42,0.65)",
                    zIndex: 1000,
                    overflowY: "auto",
                    padding: "25px"
                }}>
                    <div
                        id="hospital-invoice"
                        style={{
                            maxWidth: "750px",
                            margin: "30px auto",
                            padding: "40px",
                            background: "white",
                            borderRadius: "10px",
                            boxShadow: "0 10px 35px rgba(0,0,0,0.2)"
                        }}
                    >
                        <div style={{
                            textAlign: "center",
                            borderBottom: "3px solid #2563eb",
                            paddingBottom: "20px"
                        }}>
                            <h1 style={{ color: "#1d4ed8", margin: 0 }}>
                                CITY HOSPITAL
                            </h1>
                            <p style={{ color: "#64748b" }}>
                                Quality Healthcare | Patient Care
                            </p>
                            <h2>MEDICAL INVOICE</h2>
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            marginTop: "25px",
                            gap: "15px"
                        }}>
                            <div>
                                <h3>Bill To:</h3>
                                <p>
                                    <strong>Patient:</strong>{" "}
                                    {selectedBill.appointment?.patient?.name || "N/A"}
                                </p>
                                <p>
                                    <strong>Appointment ID:</strong>{" "}
                                    #{selectedBill.appointment?.id || "N/A"}
                                </p>
                            </div>

                            <div>
                                <h3>Invoice Details:</h3>
                                <p><strong>Invoice No:</strong> #{selectedBill.id}</p>
                                <p><strong>Date:</strong> {selectedBill.paymentDate}</p>
                                <p><strong>Status:</strong> {selectedBill.status}</p>
                            </div>
                        </div>

                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "30px"
                        }}>
                            <thead>
                            <tr style={{
                                background: "#1d4ed8",
                                color: "white"
                            }}>
                                <th style={invoiceCellStyle}>Description</th>
                                <th style={invoiceCellStyle}>Amount</th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr>
                                <td style={invoiceCellStyle}>Consultation Fee</td>
                                <td style={invoiceCellStyle}>
                                    ₹{Number(selectedBill.consultationFee || 0).toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td style={invoiceCellStyle}>Medicine Fee</td>
                                <td style={invoiceCellStyle}>
                                    ₹{Number(selectedBill.medicineFee || 0).toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td style={invoiceCellStyle}>Room Fee</td>
                                <td style={invoiceCellStyle}>
                                    ₹{Number(selectedBill.roomFee || 0).toFixed(2)}
                                </td>
                            </tr>
                            <tr style={{
                                background: "#eff6ff",
                                fontWeight: "bold"
                            }}>
                                <td style={invoiceCellStyle}>Total Amount</td>
                                <td style={invoiceCellStyle}>
                                    ₹{Number(selectedBill.totalAmount || 0).toFixed(2)}
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <div style={{
                            textAlign: "center",
                            marginTop: "45px",
                            borderTop: "1px solid #cbd5e1",
                            paddingTop: "20px"
                        }}>
                            <h3>Thank You!</h3>
                            <p>We wish you good health and a speedy recovery.</p>
                            <p style={{ color: "#64748b", fontSize: "12px" }}>
                                This is a computer-generated invoice.
                            </p>
                        </div>

                        <div className="no-print" style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "10px",
                            marginTop: "25px"
                        }}>
                            <button
                                onClick={handlePrint}
                                style={{
                                    ...buttonStyle,
                                    background: "#2563eb",
                                    color: "white"
                                }}
                            >
                                Print Invoice
                            </button>

                            <button
                                onClick={() => setSelectedBill(null)}
                                style={{
                                    ...buttonStyle,
                                    background: "#e2e8f0"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const cellStyle = {
    padding: "13px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    whiteSpace: "nowrap"
};

const invoiceCellStyle = {
    padding: "15px",
    border: "1px solid #cbd5e1",
    textAlign: "left"
};

export default Billing;
