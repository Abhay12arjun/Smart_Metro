import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import API from "../api/axios";

function Home() {
    const user = JSON.parse(localStorage.getItem("metroUser") || "null");
    const isAdmin = user?.role === "admin";
    const dashboardPath = isAdmin ? "/admin" : "/passenger";
    const roleLabel = isAdmin ? "Admin" : "Passenger";
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const res = await API.get("/stations/lines");
                setLines(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLines();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100">
            <section className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
                <div className="flex flex-col justify-center px-8 py-12 md:px-16 bg-blue-950 text-white">
                    <p className="text-cyan-300 font-bold mb-3">
                        Smart Metro Management System
                    </p>

                    <h1 className="text-5xl font-bold mb-5">
                        Move through the metro with live updates and simple controls.
                    </h1>

                    <p className="text-xl mb-8 text-slate-200">
                        Track trains, book tickets, manage wallet balance and monitor
                        operations from one clean dashboard.
                    </p>

                    {user ? (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white text-blue-950 px-5 py-4 rounded">
                                <p className="text-sm text-gray-600">Logged in as</p>
                                <p className="text-2xl font-bold">
                                    {user.name} - {roleLabel}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to={dashboardPath}
                                    className="bg-cyan-500 px-6 py-3 rounded font-bold"
                                >
                                    Open {roleLabel} Dashboard
                                </Link>

                                <Link
                                    to="/tracking"
                                    className="bg-white text-blue-950 px-6 py-3 rounded font-bold"
                                >
                                    View Train Tracking
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="bg-white text-blue-950 px-6 py-3 rounded font-bold"
                            >
                                Passenger Login
                            </Link>

                            <Link
                                to="/admin-login"
                                className="bg-white text-blue-950 px-6 py-3 rounded font-bold"
                            >
                                Admin Login
                            </Link>

                            <Link
                                to="/register"
                                className="bg-cyan-500 px-6 py-3 rounded font-bold"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                <div className="relative min-h-96 bg-slate-900">
                    <img
                        src={heroImage}
                        alt="Smart metro train"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-950 text-white p-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold">Live</p>
                                <p className="text-sm text-slate-300">Tracking</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Fast</p>
                                <p className="text-sm text-slate-300">Ticketing</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Role</p>
                                <p className="text-sm text-slate-300">Dashboards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Bengaluru Metro Lines</h2>
                    <p className="text-gray-600 mt-2">
                        Choose a metro color line and book a ticket from any of its stations.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {lines.map((line) => (
                        <div
                            key={line.line}
                            className="rounded-3xl border bg-white shadow-sm overflow-hidden"
                        >
                            <div
                                className="h-2"
                                style={{ backgroundColor: line.lineColor }}
                            />
                            <div className="p-6">
                                <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                                    {line.displayName} Line
                                </p>
                                <h3 className="text-2xl font-bold mt-3 text-slate-900">
                                    {line.displayName}
                                </h3>
                                <p className="mt-4 text-gray-600">
                                    {line.stationCount} stations across Bengaluru. The stations on this line are shown on the booking page.
                                </p>
                                <Link
                                    to={`/book-ticket?line=${line.line}`}
                                    className="inline-flex mt-6 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
                                >
                                    Book on {line.displayName}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
