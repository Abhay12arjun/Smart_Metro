import { useEffect, useState } from "react";
import API from "../api/axios";

function PassengerDashboard() {
    const [tickets, setTickets] = useState([]);
    const user = JSON.parse(localStorage.getItem("metroUser"));

    const fetchTickets = async () => {
        const res = await API.get("/tickets/my");
        setTickets(res.data);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const cancelTicket = async (id) => {
        await API.put(`/tickets/cancel/${id}`);
        fetchTickets();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-5">Passenger Dashboard</h1>

            <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">Passenger</h3>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                </div>

                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">Role</h3>
                    <h2 className="text-2xl font-bold">{user?.role}</h2>
                </div>

                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">Wallet</h3>
                    <h2 className="text-2xl font-bold">₹{user?.walletBalance}</h2>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">My Tickets</h2>

            <div className="bg-white shadow rounded">
                {tickets.map((ticket) => (
                    <div key={ticket._id} className="p-4 border-b flex justify-between">
                        <div>
                            <p>
                                {ticket.source} → {ticket.destination}
                            </p>
                            <p>Fare: ₹{ticket.fare}</p>
                            <p>Status: {ticket.status}</p>
                        </div>

                        {ticket.status === "Booked" && (
                            <button
                                onClick={() => cancelTicket(ticket._id)}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PassengerDashboard;