import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import socket from "../socket";

const lineTabs = [
    { name: "Green", color: "bg-green-600", soft: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    { name: "Yellow", color: "bg-yellow-500", soft: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    { name: "Purple", color: "bg-purple-600", soft: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
];

const statusStyles = {
    Delayed: "bg-yellow-100 text-yellow-800",
    Maintenance: "bg-blue-100 text-blue-800",
    Stopped: "bg-red-100 text-red-800",
    Running: "bg-green-100 text-green-800"
};

const formatTime = (value) => {
    if (!value) {
        return "";
    }

    return new Date(value).toLocaleString();
};

const getUserKey = () => {
    const user = JSON.parse(localStorage.getItem("metroUser") || "null");
    return user?._id || user?.id || user?.email || "";
};

const markNotificationsSeen = () => {
    const userKey = getUserKey();

    if (!userKey) {
        return;
    }

    localStorage.setItem(`metroSeenNotifications:${userKey}`, String(Date.now()));
    window.dispatchEvent(new Event("notifications-seen"));
};

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [selectedLine, setSelectedLine] = useState("Green");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data);
            setError("");
            markNotificationsSeen();
        } catch (err) {
            setError("Failed to load notifications");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        socket.on("notification-created", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            markNotificationsSeen();
        });

        return () => {
            socket.off("notification-created");
        };
    }, []);

    const notificationsByLine = useMemo(() => {
        return lineTabs.reduce((map, line) => {
            map[line.name] = notifications.filter((item) => item.line === line.name);
            return map;
        }, {});
    }, [notifications]);

    const selectedLineConfig = lineTabs.find((line) => line.name === selectedLine) || lineTabs[0];
    const visibleNotifications = notificationsByLine[selectedLine] || [];

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-950">Notifications</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Train activity alerts for delayed, maintenance, and stopped trains.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {lineTabs.map((line) => {
                    const isSelected = selectedLine === line.name;
                    const count = notificationsByLine[line.name]?.length || 0;

                    return (
                        <button
                            key={line.name}
                            type="button"
                            onClick={() => setSelectedLine(line.name)}
                            className={`rounded-lg border p-4 text-left shadow-sm transition ${isSelected
                                ? `${line.border} ${line.soft}`
                                : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`h-4 w-4 rounded-full ${line.color}`} />
                                    <span className="text-lg font-bold text-slate-950">{line.name}</span>
                                </div>
                                <span className={`rounded px-2 py-1 text-sm font-bold ${isSelected ? line.text : "text-slate-600"}`}>
                                    {count}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <section className={`rounded-lg border ${selectedLineConfig.border} bg-white shadow-sm`}>
                <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${selectedLineConfig.soft}`}>
                    <h2 className="text-xl font-bold text-slate-950">{selectedLine} Line</h2>
                    <span className={`rounded px-3 py-1 text-sm font-bold ${selectedLineConfig.text}`}>
                        {visibleNotifications.length} alerts
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading notifications...</div>
                ) : visibleNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No delayed, maintenance, or stopped train alerts for this line.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visibleNotifications.map((item) => (
                            <article key={item._id || `${item.trainNo}-${item.createdAt}`} className="p-5">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                                            <span className={`rounded px-2 py-1 text-xs font-bold ${statusStyles[item.status] || "bg-slate-100 text-slate-700"}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                                        <p className="mt-2 text-xs font-semibold text-slate-500">
                                            Train {item.trainNo} {item.trainName ? `- ${item.trainName}` : ""}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">
                                        {formatTime(item.createdAt)}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Notifications;
