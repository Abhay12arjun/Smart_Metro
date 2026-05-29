import { useEffect, useState } from "react";
import API from "../api/axios";
import socket from "../socket";
import StatCard from "../components/StatCard";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [trains, setTrains] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [trainStatusDrafts, setTrainStatusDrafts] = useState({});
    const [manageLineFilter, setManageLineFilter] = useState("All");

    const [trainForm, setTrainForm] = useState({
        trainName: "",
        trainNo: "",
        line: "Purple",
        direction: "Kengeri to Purple Terminal",
        startStation: "Kengeri",
        endStation: "Purple Terminal",
        distance: "43.35",
        status: "Running"
    });

    const fetchDashboard = async () => {
        try {
            const res = await API.get("/admin/dashboard");
            setStats(res.data);
        } catch (err) {
            setError("Failed to load dashboard stats");
            console.error(err);
        }
    };

    const fetchTrains = async () => {
        try {
            const res = await API.get("/trains");
            setTrains(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load trains");
            console.error(err);
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await API.get("/tickets/all");
            setTickets(res.data);
        } catch (err) {
            setError("Failed to load tickets");
            console.error(err);
        }
    };

    const refreshAdminData = () => {
        fetchDashboard();
        fetchTrains();
        fetchTickets();
    };

    useEffect(() => {
        refreshAdminData();

        socket.on("newTicket", refreshAdminData);
        socket.on("ticketCancelled", refreshAdminData);
        socket.on("trainUpdated", refreshAdminData);
        socket.on("train-location-updated", refreshAdminData);
        socket.on("trainDeleted", refreshAdminData);

        const refreshTimer = setInterval(refreshAdminData, 30000);

        return () => {
            socket.off("newTicket");
            socket.off("ticketCancelled");
            socket.off("trainUpdated");
            socket.off("train-location-updated");
            socket.off("trainDeleted");
            clearInterval(refreshTimer);
        };
    }, []);

    const addTrain = async (e) => {
        e.preventDefault();

        if (
            !trainForm.trainName.trim() ||
            !trainForm.trainNo.trim() ||
            !trainForm.line.trim() ||
            !trainForm.direction.trim() ||
            !trainForm.startStation.trim() ||
            !trainForm.endStation.trim() ||
            !trainForm.distance.toString().trim()
        ) {
            alert("Please fill all fields");
            return;
        }

        if (trainForm.startStation.toLowerCase() === trainForm.endStation.toLowerCase()) {
            alert("Start and end station cannot be the same");
            return;
        }

        try {
            await API.post("/trains", {
                trainName: trainForm.trainName,
                trainNo: trainForm.trainNo,
                line: trainForm.line,
                direction: trainForm.direction,
                startStation: trainForm.startStation,
                endStation: trainForm.endStation,
                distance: Number(trainForm.distance),
                status: trainForm.status
            });

            setTrainForm({
                trainName: "",
                trainNo: "",
                line: "Purple",
                direction: "Kengeri to Purple Terminal",
                startStation: "Kengeri",
                endStation: "Purple Terminal",
                distance: "43.35",
                status: "Running"
            });

            refreshAdminData();
            alert("Train added successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add train");
        }
    };

    const getStatusDraft = (train) => trainStatusDrafts[train._id] || {
        status: train.status,
        delayValue: train.delayMinutes ? String(train.delayMinutes) : "5",
        delayUnit: "minutes"
    };

    const updateTrainStatusDraft = (id, updates) => {
        setTrainStatusDrafts((current) => ({
            ...current,
            [id]: {
                ...(current[id] || {}),
                ...updates
            }
        }));
    };

    const getDelayMinutes = (draft) => {
        const value = Math.max(Number(draft.delayValue) || 0, 0);
        return draft.delayUnit === "hours" ? value * 60 : value;
    };

    const updateTrainStatus = async (train) => {
        const draft = getStatusDraft(train);

        try {
            await API.put(`/trains/${train._id}`, {
                status: draft.status,
                delayMinutes: draft.status === "Delayed" ? getDelayMinutes(draft) : 0
            });
            refreshAdminData();
        } catch (err) {
            alert("Failed to update train status");
        }
    };

    const deleteTrain = async (id) => {
        if (!window.confirm("Are you sure you want to delete this train?")) {
            return;
        }

        try {
            await API.delete(`/trains/${id}`);
            refreshAdminData();
            alert("Train deleted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete train");
        }
    };

    const chartData = [
        { name: "Passengers", value: stats.totalPassengers || 0 },
        { name: "Running Trains", value: stats.runningTrains || 0 },
        { name: "Tickets", value: stats.totalTickets || 0 },
        { name: "Revenue", value: stats.ticketRevenue || stats.totalRevenue || 0 }
    ];
    const manageLineFilters = ["All", "Green", "Yellow", "Purple"];
    const managedTrains = manageLineFilter === "All"
        ? trains
        : trains.filter((train) => train.line === manageLineFilter);
    const getLineDisplay = (line) => {
        if (!line) return "Metro";
        return `${line.charAt(0).toUpperCase()}${line.slice(1)} Line`;
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-blue-950">Admin Dashboard</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Passengers"
                    value={stats.totalPassengers || 0}
                    icon="👥"
                />
                <StatCard
                    title="Running Trains"
                    value={stats.runningTrains || 0}
                    icon="🚆"
                />
                <StatCard
                    title="Total Tickets"
                    value={stats.totalTickets || 0}
                    icon="🎫"
                />
                <StatCard
                    title="Ticket Revenue"
                    value={`Rs.${stats.ticketRevenue || stats.totalRevenue || 0}`}
                    icon="💵"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <StatCard title="Total Trains" value={stats.totalTrains || 0} icon="T" />
                <StatCard title="Delayed Trains" value={stats.delayedTrains || 0} icon="D" />
                <StatCard title="Stopped Trains" value={stats.stoppedTrains || 0} icon="S" />
                <StatCard title="Maintenance" value={stats.maintenanceTrains || 0} icon="M" />
                <StatCard title="Wallet Topups" value={`Rs.${stats.walletTopups || 0}`} icon="W" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-950">Metro Analytics</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => value.toLocaleString()} />
                        <Bar dataKey="value" fill="#1e3a8a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <form
                onSubmit={addTrain}
                className="bg-white p-6 rounded-lg shadow-lg mb-8"
            >
                <h2 className="text-2xl font-bold mb-6 text-blue-950">Add New Train</h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Train Name</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., Metro Express"
                            value={trainForm.trainName}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, trainName: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Train No</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., P-101"
                            value={trainForm.trainNo}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, trainNo: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Line</label>
                        <select
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            value={trainForm.line}
                            onChange={(e) => setTrainForm({ ...trainForm, line: e.target.value })}
                        >
                            <option value="Purple">Purple</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., Challaghatta to Whitefield"
                            value={trainForm.direction}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, direction: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Station</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., Challaghatta"
                            value={trainForm.startStation}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, startStation: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Station</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., Whitefield"
                            value={trainForm.endStation}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, endStation: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                        <input
                            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:border-blue-950"
                            placeholder="e.g., 43.35"
                            type="number"
                            step="0.01"
                            value={trainForm.distance}
                            required
                            onChange={(e) =>
                                setTrainForm({ ...trainForm, distance: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="bg-blue-950 text-white rounded w-full py-3 font-semibold hover:bg-blue-900 transition"
                        >
                            Add Train
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="px-6 py-4 bg-blue-950 text-white">
                    <h2 className="text-2xl font-bold">Recent Tickets</h2>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-lg">No tickets booked yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold">Passenger</th>
                                    <th className="text-left px-6 py-3 font-semibold">Line</th>
                                    <th className="text-left px-6 py-3 font-semibold">Route</th>
                                    <th className="text-left px-6 py-3 font-semibold">Fare</th>
                                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                                    <th className="text-left px-6 py-3 font-semibold">Booked Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.slice(0, 10).map((ticket) => (
                                    <tr key={ticket._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-950">{ticket.passenger?.name || "Passenger"}</p>
                                            <p className="text-sm text-slate-500">{ticket.passenger?.email || ""}</p>
                                        </td>
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
                                            {ticket.source} {"->"} {ticket.destination}
                                        </td>
                                        <td className="px-6 py-4">Rs.{ticket.fare}</td>
                                        <td className="px-6 py-4">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                                {ticket.status} / {ticket.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex flex-col gap-4 px-6 py-4 bg-blue-950 text-white md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold">Manage Trains</h2>
                    <div className="flex flex-wrap gap-2">
                        {manageLineFilters.map((line) => (
                            <button
                                key={line}
                                type="button"
                                onClick={() => setManageLineFilter(line)}
                                className={`rounded px-3 py-2 text-sm font-semibold transition ${manageLineFilter === line
                                    ? "bg-white text-blue-950"
                                    : "bg-blue-900 text-white hover:bg-blue-800"
                                    }`}
                            >
                                {line}
                            </button>
                        ))}
                    </div>
                </div>

                {managedTrains.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-lg">No trains found for this line.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold">Train Details</th>
                                    <th className="text-left px-6 py-3 font-semibold">Route</th>
                                    <th className="text-left px-6 py-3 font-semibold">Position</th>
                                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                                    <th className="text-left px-6 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managedTrains.map((train) => {
                                    const draft = getStatusDraft(train);
                                    const selectedStatus = draft.status;

                                    return (
                                    <tr key={train._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{train.trainName}</h3>
                                                <p className="text-sm text-gray-600">#{train.trainNo} • {train.line}</p>
                                                <p className="text-sm text-gray-500">{train.direction}</p>
                                                <p className="text-sm text-gray-500">
                                                    {train.directionType === "coming" ? "Coming" : "Going"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {train.startStation} → {train.endStation}
                                            <p className="text-sm text-slate-500">{train.distance} km</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {train.currentStation}
                                            <p className="text-sm text-slate-500">Next: {train.nextStation}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex min-w-56 flex-col gap-2">
                                                <select
                                                    className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-950"
                                                    value={selectedStatus}
                                                    onChange={(e) => {
                                                        const nextStatus = e.target.value;
                                                        const nextDraft = {
                                                            ...draft,
                                                            status: nextStatus
                                                        };

                                                        updateTrainStatusDraft(train._id, nextDraft);

                                                        if (nextStatus !== "Delayed") {
                                                            API.put(`/trains/${train._id}`, {
                                                                status: nextStatus,
                                                                delayMinutes: 0
                                                            })
                                                                .then(refreshAdminData)
                                                                .catch(() => alert("Failed to update train status"));
                                                        }
                                                    }}
                                                >
                                                    <option value="Running">Running</option>
                                                    <option value="Stopped">Stopped</option>
                                                    <option value="Delayed">Delayed</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>

                                                {selectedStatus === "Delayed" && (
                                                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                                                        <input
                                                            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-950"
                                                            type="number"
                                                            min="1"
                                                            value={draft.delayValue}
                                                            onChange={(e) =>
                                                                updateTrainStatusDraft(train._id, {
                                                                    status: "Delayed",
                                                                    delayValue: e.target.value
                                                                })
                                                            }
                                                        />
                                                        <select
                                                            className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-950"
                                                            value={draft.delayUnit}
                                                            onChange={(e) =>
                                                                updateTrainStatusDraft(train._id, {
                                                                    status: "Delayed",
                                                                    delayUnit: e.target.value
                                                                })
                                                            }
                                                        >
                                                            <option value="minutes">Min</option>
                                                            <option value="hours">Hr</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            className="rounded bg-blue-950 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900"
                                                            onClick={() => updateTrainStatus(train)}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => deleteTrain(train._id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
