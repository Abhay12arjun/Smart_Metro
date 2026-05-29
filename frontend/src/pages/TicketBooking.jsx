import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";

function TicketBooking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem("metroUser") || "null");

    const [lines, setLines] = useState([]);
    const [stations, setStations] = useState([]);
    const [selectedLine, setSelectedLine] = useState("green");
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const selectedLineInfo =
        lines.find((line) => line.line === selectedLine) ||
        ({
            displayName: selectedLine.charAt(0).toUpperCase() + selectedLine.slice(1),
            lineColor: "#2563eb"
        });

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const res = await API.get("/stations/lines");
                setLines(res.data);

                const queryLine = searchParams.get("line")?.trim().toLowerCase();
                const initialLine = res.data.find((item) => item.line === queryLine)
                    ? queryLine
                    : res.data[0]?.line || "green";

                setSelectedLine(initialLine);
            } catch (err) {
                setError("Unable to load metro lines. Please try again later.");
            }
        };

        fetchLines();
    }, [searchParams]);

    useEffect(() => {
        const fetchStations = async () => {
            if (!selectedLine) return;

            try {
                const res = await API.get(`/stations/line/${selectedLine}`);
                setStations(res.data);
                setSelectedSource("");
                setSelectedDestination("");
            } catch (err) {
                setError("Unable to load stations for the selected line.");
            }
        };

        fetchStations();
    }, [selectedLine]);

    const routeInfo = (() => {
        const sourceStation = stations.find(
            (station) => station.stationName === selectedSource || station.stationCode === selectedSource
        );
        const destinationStation = stations.find(
            (station) => station.stationName === selectedDestination || station.stationCode === selectedDestination
        );

        if (!sourceStation || !destinationStation || sourceStation.stationCode === destinationStation.stationCode) {
            return { stops: 0, distanceKm: 0, fare: 0 };
        }

        const stops = Math.abs(destinationStation.sequence - sourceStation.sequence);
        const fare = Math.max(20, 20 + stops * 15);
        const distanceKm = Number((Math.max(1.5, stops * 1.5)).toFixed(1));

        return { stops, distanceKm, fare };
    })();

    const handleStationClick = (stationName) => {
        setError("");
        setSuccess("");

        if (!selectedSource || (selectedSource && selectedDestination)) {
            setSelectedSource(stationName);
            setSelectedDestination("");
            return;
        }

        if (selectedSource === stationName) {
            setError("Please choose a different destination station.");
            return;
        }

        setSelectedDestination(stationName);
    };

    const bookTicket = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!selectedLine) {
            setError("Please choose a metro line.");
            return;
        }

        if (!selectedSource) {
            setError("Please choose a source station.");
            return;
        }

        if (!selectedDestination) {
            setError("Please choose a destination station.");
            return;
        }

        if (selectedSource === selectedDestination) {
            setError("Source and destination cannot be the same station.");
            return;
        }

        if (!routeInfo.fare) {
            setError("Unable to calculate a valid route for the selected stations.");
            return;
        }

        if (user.walletBalance < routeInfo.fare) {
            setError(`Insufficient wallet balance. You need ₹${routeInfo.fare} but have ₹${user.walletBalance}`);
            return;
        }

        setLoading(true);

        try {
            const res = await API.post("/tickets/book", {
                line: selectedLine,
                source: selectedSource,
                destination: selectedDestination
            });

            setSuccess("Ticket booked successfully!");

            const updatedUser = {
                ...user,
                walletBalance: res.data.walletBalance
            };

            localStorage.setItem("metroUser", JSON.stringify(updatedUser));

            setTimeout(() => {
                navigate("/passenger");
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Ticket booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-2 text-center text-blue-950">
                    Book Metro Ticket
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Your balance: <span className="font-bold">₹{user?.walletBalance}</span>
                </p>

                <form onSubmit={bookTicket} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Metro Line
                        </label>
                        <div className="flex items-center gap-3 mb-3">
                            <span
                                className="inline-flex h-3.5 w-3.5 rounded-full"
                                style={{ backgroundColor: selectedLineInfo.lineColor }}
                            />
                            <span className="text-sm font-semibold text-slate-800">
                                {selectedLineInfo.displayName} Line
                            </span>
                        </div>
                        <select
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-blue-950"
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                        >
                            {lines.map((line) => (
                                <option key={line.line} value={line.line}>
                                    {line.displayName} Line
                                </option>
                            ))}
                        </select>
                    </div>

                    {stations.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <span
                                    className="inline-flex h-3.5 w-3.5 rounded-full"
                                    style={{ backgroundColor: selectedLineInfo.lineColor }}
                                />
                                <p className="text-sm font-semibold text-slate-800">Stations on this line</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto sm:grid-cols-2">
                                {stations.map((station) => {
                                    const isSource = selectedSource === station.stationName;
                                    const isDestination = selectedDestination === station.stationName;

                                    return (
                                        <button
                                            key={station.stationCode}
                                            type="button"
                                            onClick={() => handleStationClick(station.stationName)}
                                            className={`rounded-xl border px-3 py-2 text-left text-sm transition flex items-center justify-between gap-2 ${isSource || isDestination
                                                ? "bg-white font-bold text-blue-950 shadow-sm"
                                                : "bg-white/60 text-slate-700 hover:bg-white"
                                                }`}
                                            style={{ borderColor: selectedLineInfo.lineColor }}
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selectedLineInfo.lineColor }} />
                                                <span className="min-w-0">
                                                    {station.sequence}. {station.stationName}
                                                </span>
                                            </span>
                                            {(isSource || isDestination) && (
                                                <span className="shrink-0 rounded bg-blue-950 px-2 py-1 text-[10px] font-bold text-white">
                                                    {isSource ? "Source" : "Destination"}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-xs font-medium text-slate-500">
                                First click selects source. Second click selects destination.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Source Station
                        </label>
                        <select
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-blue-950"
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                        >
                            <option value="">Select source station</option>
                            {stations.map((station) => (
                                <option key={station.stationCode} value={station.stationName}>
                                    {station.stationName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Destination Station
                        </label>
                        <select
                            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:border-blue-950"
                            value={selectedDestination}
                            onChange={(e) => setSelectedDestination(e.target.value)}
                        >
                            <option value="">Select destination station</option>
                            {stations.map((station) => (
                                <option key={station.stationCode} value={station.stationName}>
                                    {station.stationName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-gray-700">Estimated fare</p>
                        <p className="mt-2 text-3xl font-semibold text-blue-950">₹{routeInfo.fare || "--"}</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                                <p className="font-semibold text-slate-800">Stops</p>
                                <p>{routeInfo.stops || "--"}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Distance</p>
                                <p>{routeInfo.distanceKm ? `${routeInfo.distanceKm} km` : "--"}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            Fare and distance are estimated from the number of stops between selected stations.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-950 text-white p-3 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Booking..." : "Book Ticket"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TicketBooking;
