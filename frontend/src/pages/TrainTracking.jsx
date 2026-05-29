import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import socket from "../socket";
import trainMarker from "../assets/train-marker.svg";

const lineStyles = {
    Purple: {
        border: "border-purple-200",
        badge: "bg-purple-100 text-purple-800",
        track: "bg-purple-600"
    },
    Green: {
        border: "border-green-200",
        badge: "bg-green-100 text-green-800",
        track: "bg-green-600"
    },
    Yellow: {
        border: "border-yellow-200",
        badge: "bg-yellow-100 text-yellow-800",
        track: "bg-yellow-500"
    }
};

const lineFilters = ["All", "Purple", "Green", "Yellow"];

const getLineStyle = (line) => lineStyles[line] || lineStyles.Purple;

const statusStyles = {
    Running: "text-green-600",
    Delayed: "text-yellow-600",
    Stopped: "text-red-600",
    Maintenance: "text-blue-700"
};

const getTrainStatusText = (train) => {
    if (train.status === "Delayed" && train.delayLabel) {
        return `Delayed by ${train.delayLabel}`;
    }

    return train.status;
};

function TrackingLine({ train }) {
    const style = getLineStyle(train.line);
    const markerPosition = Math.min(Math.max(Number(train.trainMarkerPosition) || 0, 0), 100);
    const progress = Math.min(Math.max(Number(train.progressPercent) || 0, 0), 100);
    const isReturning = train.directionType === "coming";
    const routeStartStation = train.displayStartStation || train.startStation;
    const routeEndStation = train.displayEndStation || train.endStation;
    const routeStations = Array.isArray(train.routeStations) && train.routeStations.length > 0
        ? train.routeStations
        : [routeStartStation, routeEndStation].filter(Boolean);
    const stations = isReturning ? [...routeStations].reverse() : routeStations;
    const startStation = stations[0] || routeStartStation;
    const endStation = stations[stations.length - 1] || routeEndStation;
    const displayMarkerPosition = isReturning ? progress : markerPosition;
    const trackMinWidth = Math.max(stations.length * 92, 380);
    const stationDenominator = Math.max(stations.length - 1, 1);
    const progressStyle = { left: 0, width: `${displayMarkerPosition}%` };

    return (
        <div className="mt-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
                <span className="min-w-0 truncate">{startStation}</span>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {isReturning ? "Returning" : "Going"} {progress}%
                </span>
                <span className="min-w-0 truncate text-right">{endStation}</span>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="relative" style={{ minWidth: `${trackMinWidth}px` }}>
                    <div className="relative h-44 px-8 pt-6">
                        <div className="absolute left-8 right-8 top-16 h-2 rounded bg-slate-300">
                            <div
                                className={`absolute top-0 h-2 rounded ${style.track}`}
                                style={progressStyle}
                            />
                        </div>

                        <div className="absolute left-8 right-8 top-12">
                            {stations.map((station, index) => {
                                const stationPosition = (index / stationDenominator) * 100;
                                const isCurrentStation = station === train.currentStation;

                                return (
                                    <div
                                        key={`${station}-${index}`}
                                        className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
                                        style={{ left: `${stationPosition}%` }}
                                        title={station}
                                    >
                                        <span
                                            className={`h-8 w-8 rounded-full border-4 border-white shadow ${isCurrentStation ? style.track : "bg-slate-950"}`}
                                        />
                                        <span className="mt-8 w-20 break-words text-center text-[10px] font-semibold leading-tight text-slate-600">
                                            {station}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="absolute left-8 right-8 top-0">
                            <div
                                className="absolute z-20 flex -translate-x-1/2 flex-col items-center"
                                style={{ left: `${displayMarkerPosition}%` }}
                                title={`${train.trainName}: ${train.direction}`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow-xl">
                                    <img
                                        src={trainMarker}
                                        alt={`${train.trainName} ${train.directionType}`}
                                        className={`h-10 w-10 ${isReturning ? "rotate-180" : ""}`}
                                    />
                                </div>
                                <span className="mt-1 rounded bg-slate-950 px-2 py-1 text-[11px] font-bold text-white shadow">
                                    {train.currentStation}
                                </span>
                            </div>
                        </div>

                        <div className="absolute left-8 right-8 top-36 flex items-start justify-between gap-4 text-xs font-bold text-slate-700">
                            <span className="max-w-32 text-left">{startStation}</span>
                            <span className="max-w-32 text-right">{endStation}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrainCard({ train }) {
    const style = getLineStyle(train.line);
    const directionLabel = train.directionType === "coming" ? "Returning" : "Going";
    const statusText = getTrainStatusText(train);
    const statusClass = statusStyles[train.status] || "text-slate-700";

    return (
        <article className={`rounded-lg border ${style.border} bg-white p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">{train.trainName}</h2>
                    <p className="text-sm text-slate-500">Train No: {train.trainNo}</p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-bold ${style.badge}`}>
                    {train.line}
                </span>
            </div>

            <TrackingLine train={train} />

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Current Station</p>
                    <p className="font-semibold text-slate-950">{train.currentStation}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Next Station</p>
                    <p className="font-semibold text-slate-950">{train.nextStation}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Direction</p>
                    <p className="font-semibold text-slate-950">{directionLabel}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">ETA Next</p>
                    <p className="font-semibold text-slate-950">
                        {["Stopped", "Maintenance"].includes(train.status)
                            ? "Not available"
                            : `${train.minutesToNextStation} min`}
                    </p>
                </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                <p>{train.direction}</p>
                <p>
                    {train.distanceCoveredKm} km covered, {train.distanceToNextStationKm} km to next station
                </p>
                <p className={`mt-2 font-bold ${statusClass}`}>
                    {statusText}
                </p>
                {train.status === "Stopped" && (
                    <p className="mt-1 text-red-600">Train is currently stopped at {train.currentStation}.</p>
                )}
                {train.status === "Maintenance" && (
                    <p className="mt-1 text-blue-700">Train is under maintenance at {train.currentStation}.</p>
                )}
            </div>
        </article>
    );
}

function DirectionColumn({ title, trains }) {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
                <span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {trains.length} trains
                </span>
            </div>

            {trains.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
                    No trains in this direction.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {trains.map((train) => (
                        <TrainCard key={train._id} train={train} />
                    ))}
                </div>
            )}
        </section>
    );
}

function TrainTracking() {
    const [trains, setTrains] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("");
    const [selectedLine, setSelectedLine] = useState("All");

    const fetchTrains = async () => {
        const res = await API.get("/trains");
        setTrains(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
    };

    useEffect(() => {
        fetchTrains();

        socket.on("trainUpdated", fetchTrains);
        socket.on("train-location-updated", fetchTrains);

        const refreshTimer = setInterval(fetchTrains, 10000);

        return () => {
            socket.off("trainUpdated");
            socket.off("train-location-updated");
            clearInterval(refreshTimer);
        };
    }, []);

    const { filteredTrains, goingTrains, comingTrains } = useMemo(() => {
        const visibleTrains = selectedLine === "All"
            ? trains
            : trains.filter((train) => train.line === selectedLine);

        const sortedTrains = [...visibleTrains].sort((a, b) => {
            if (a.line !== b.line) {
                return a.line.localeCompare(b.line);
            }

            return a.trainNo.localeCompare(b.trainNo);
        });

        return {
            filteredTrains: sortedTrains,
            goingTrains: sortedTrains.filter((train) => train.directionType === "going"),
            comingTrains: sortedTrains.filter((train) => train.directionType === "coming")
        };
    }, [selectedLine, trains]);

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-950">Real-Time Train Tracking</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Position changes by train speed, line distance, and station spacing.
                    </p>
                </div>
                {lastUpdated && (
                    <p className="text-sm font-medium text-slate-500">Last updated: {lastUpdated}</p>
                )}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {lineFilters.map((line) => {
                    const isSelected = selectedLine === line;
                    const style = line === "All" ? null : getLineStyle(line);

                    return (
                        <button
                            key={line}
                            type="button"
                            onClick={() => setSelectedLine(line)}
                            className={`rounded px-4 py-2 text-sm font-bold transition ${isSelected
                                ? line === "All"
                                    ? "bg-slate-950 text-white"
                                    : style.badge
                                : "bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                                }`}
                        >
                            {line}
                        </button>
                    );
                })}
                <span className="ml-0 rounded bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm md:ml-2">
                    Showing {filteredTrains.length} trains
                </span>
            </div>

            {filteredTrains.length === 0 ? (
                <p className="text-gray-600">No trains available for this line.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DirectionColumn title="Going Trains" trains={goingTrains} />
                    <DirectionColumn title="Returning Trains" trains={comingTrains} />
                </div>
            )}
        </main>
    );
}

export default TrainTracking;
