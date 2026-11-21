
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

function DashboardCharts({ appointments = [] }) {

    const statusCounts = [
        {
            status: "SCHEDULED",
            count: appointments.filter(
                a => a.status?.toUpperCase() === "SCHEDULED"
            ).length
        },
        {
            status: "CONFIRMED",
            count: appointments.filter(
                a => a.status?.toUpperCase() === "CONFIRMED"
            ).length
        },
        {
            status: "COMPLETED",
            count: appointments.filter(
                a => a.status?.toUpperCase() === "COMPLETED"
            ).length
        },
        {
            status: "CANCELLED",
            count: appointments.filter(
                a => a.status?.toUpperCase() === "CANCELLED"
            ).length
        }
    ];

    return (
        <div style={{ marginTop: "35px" }}>
            <h2>Appointment Reports</h2>

            <p>Total Appointments: {appointments.length}</p>

            <div style={{
                width: "100%",
                height: "350px",
                marginTop: "20px"
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default DashboardCharts;
