import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import StatCard from "../components/StatCard";

const getLineDisplay = (line) => {
    if (!line) return "Metro";
    return `${line.charAt(0).toUpperCase()}${line.slice(1)} Line`;
};

function PassengerDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = JSON.parse(localStorage.getItem("metroUser"));

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await API.get("/tickets/my");
            setTickets(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load tickets");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const cancelTicket = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this ticket?")) {
            return;
        }

        try {
            const res = await API.put(`/tickets/cancel/${id}`);

            const updatedUser = {
                ...user,
                walletBalance: res.data.walletBalance
            };

            localStorage.setItem("metroUser", JSON.stringify(updatedUser));
            fetchTickets();
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel ticket");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-blue-950">Passenger Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="Name"
                    value={user?.name || "Guest"}
                    icon="👤"
                />
                <StatCard
                    title="Wallet Balance"
                    value={`₹${user?.walletBalance || 0}`}
                    icon="💰"
                />
                <StatCard
                    title="Total Tickets"
                    value={tickets.length}
                    icon="🎫"
                />
            </div>

            <div className="mb-6 flex gap-4">
                <Link
                    to="/book-ticket"
                    className="bg-blue-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
                >
                    Book New Ticket
                </Link>
                <button
                    onClick={fetchTickets}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-blue-950 text-white">
                    <h2 className="text-2xl font-bold">My Tickets</h2>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-lg mb-4">No tickets booked yet.</p>
                        <Link
                            to="/book-ticket"
                            className="text-blue-950 font-bold hover:underline"
                        >
                            Book your first ticket
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold">Line</th>
                                    <th className="text-left px-6 py-3 font-semibold">Route</th>
                                    <th className="text-left px-6 py-3 font-semibold">Fare</th>
                                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                                    <th className="text-left px-6 py-3 font-semibold">Payment</th>
                                    <th className="text-left px-6 py-3 font-semibold">Booked Date</th>
                                    <th className="text-left px-6 py-3 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-800">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: ticket.lineColor || "#1e3a8a" }}
                                                />
                                                {getLineDisplay(ticket.line)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {ticket.source} → {ticket.destination}
                                        </td>
                                        <td className="px-6 py-4">₹{ticket.fare}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${ticket.status === "Booked"
                                                        ? "bg-green-100 text-green-800"
                                                        : ticket.status === "Cancelled"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${ticket.paymentStatus === "Paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : ticket.paymentStatus === "Refunded"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {ticket.paymentStatus || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {ticket.status === "Booked" && (
                                                <button
                                                    onClick={() => cancelTicket(ticket._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PassengerDashboard;
