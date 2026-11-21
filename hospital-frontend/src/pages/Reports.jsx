
import { useEffect, useState } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Reports() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [billings, setBillings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const [patientRes, doctorRes, appointmentRes, billingRes] =
                await Promise.all([
                    api.get("/patients"),
                    api.get("/doctors"),
                    api.get("/appointments"),
                    api.get("/billings")
                ]);

            setPatients(patientRes.data);
            setDoctors(doctorRes.data);
            setAppointments(appointmentRes.data);
            setBillings(billingRes.data);
        } catch (err) {
            setError("Unable to load reports. Please check your login and API access.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPatientReport = () => {
        const doc = new jsPDF();

        doc.text("Hospital - Patient Report", 14, 15);
        doc.text(`Total Patients: ${patients.length}`, 14, 25);

        autoTable(doc, {
            startY: 32,
            head: [["ID", "Name", "Email", "Age", "Gender"]],
            body: patients.map(p => [
                p.id,
                p.name,
                p.email,
                p.age,
                p.gender
            ])
        });

        doc.save("patient-report.pdf");
    };

    const downloadDoctorReport = () => {
        const doc = new jsPDF();

        doc.text("Hospital - Doctor Report", 14, 15);
        doc.text(`Total Doctors: ${doctors.length}`, 14, 25);

        autoTable(doc, {
            startY: 32,
            head: [["ID", "Name", "Email", "Specialization"]],
            body: doctors.map(d => [
                d.id,
                d.name,
                d.email,
                d.specialization
            ])
        });

        doc.save("doctor-report.pdf");
    };

    const downloadAppointmentReport = () => {
        const doc = new jsPDF();

        doc.text("Hospital - Appointment Report", 14, 15);
        doc.text(`Total Appointments: ${appointments.length}`, 14, 25);

        autoTable(doc, {
            startY: 32,
            head: [["ID", "Patient", "Doctor", "Date", "Status"]],
            body: appointments.map(a => [
                a.id,
                a.patient?.name || "N/A",
                a.doctor?.name || "N/A",
                a.appointmentDate || "N/A",
                a.status || "N/A"
            ])
        });

        doc.save("appointment-report.pdf");
    };

    const downloadBillingReport = () => {
        const doc = new jsPDF();

        doc.text("Hospital - Billing Report", 14, 15);
        doc.text(`Total Bills: ${billings.length}`, 14, 25);

        autoTable(doc, {
            startY: 32,
            head: [["ID", "Patient", "Payment Date", "Total", "Status"]],
            body: billings.map(b => [
                b.id,
                b.appointment?.patient?.name || "N/A",
                b.paymentDate || "N/A",
                b.totalAmount ?? "N/A",
                b.status || "N/A"
            ])
        });

        doc.save("billing-report.pdf");
    };

    if (loading) return <h3>Loading reports...</h3>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>Hospital Reports</h2>

            <h3>Summary</h3>
            <p>Total Patients: {patients.length}</p>
            <p>Total Doctors: {doctors.length}</p>
            <p>Total Appointments: {appointments.length}</p>
            <p>Total Bills: {billings.length}</p>

            <hr />

            <h3>Download PDF Reports</h3>

            <button onClick={downloadPatientReport}>
                Download Patient Report
            </button>

            <br /><br />

            <button onClick={downloadDoctorReport}>
                Download Doctor Report
            </button>

            <br /><br />

            <button onClick={downloadAppointmentReport}>
                Download Appointment Report
            </button>

            <br /><br />

            <button onClick={downloadBillingReport}>
                Download Billing Report
            </button>
        </div>
    );
}

export default Reports;
