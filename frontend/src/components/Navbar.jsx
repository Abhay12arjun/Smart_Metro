import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket from "../socket";

const getSeenNotificationKey = (userKey) => `metroSeenNotifications:${userKey}`;

const getUnreadCount = (notifications, userKey) => {
    const seenAt = Number(localStorage.getItem(getSeenNotificationKey(userKey)) || 0);
    return notifications.filter((item) => new Date(item.createdAt).getTime() > seenAt).length;
};

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("metroUser") || "null");
    const roleLabel = user?.role === "admin" ? "Admin" : "Passenger";
    const userKey = user?._id || user?.id || user?.email || "";
    const [notificationCount, setNotificationCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setNotificationCount(0);
            return undefined;
        }

        const fetchNotificationCount = async () => {
            try {
                const res = await API.get("/notifications");
                setNotificationCount(getUnreadCount(res.data, userKey));
            } catch (err) {
                setNotificationCount(0);
            }
        };

        fetchNotificationCount();

        socket.on("notification-created", () => {
            if (location.pathname === "/notifications") {
                localStorage.setItem(getSeenNotificationKey(userKey), String(Date.now()));
                setNotificationCount(0);
                return;
            }

            setNotificationCount((count) => count + 1);
        });

        const resetNotificationCount = () => {
            setNotificationCount(0);
        };

        window.addEventListener("notifications-seen", resetNotificationCount);

        if (location.pathname === "/notifications") {
            setNotificationCount(0);
        }

        return () => {
            socket.off("notification-created");
            window.removeEventListener("notifications-seen", resetNotificationCount);
        };
    }, [userKey, location.pathname]);

    const logout = () => {
        localStorage.removeItem("metroUser");
        localStorage.removeItem("metroToken");
        navigate("/login");
        window.location.reload();
    };

    const closeMenu = () => setMenuOpen(false);

    const notificationLink = (
        <Link to="/notifications" onClick={closeMenu} className="relative inline-flex items-center">
            Notifications
            {notificationCount > 0 && (
                <span className="ml-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    {notificationCount}
                </span>
            )}
        </Link>
    );

    return (
        <nav className="bg-blue-950 px-4 py-4 text-white md:flex md:items-center md:justify-between md:gap-6 md:px-8">
            <div className="flex items-center justify-between gap-4">
                <Link to="/" onClick={closeMenu} className="text-2xl font-bold">
                    Smart Metro
                </Link>

                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="rounded border border-white/30 px-3 py-2 text-sm font-bold md:hidden"
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? "Close" : "Menu"}
                </button>
            </div>

            <div className={`${menuOpen ? "flex" : "hidden"} mt-4 flex-col gap-4 md:mt-0 md:flex md:flex-row md:items-center md:justify-end md:gap-5`}>
                <Link to="/" onClick={closeMenu}>Home</Link>

                {user?.role === "passenger" && (
                    <>
                        <Link to="/passenger" onClick={closeMenu}>Dashboard</Link>
                        <Link to="/book-ticket" onClick={closeMenu}>Book Ticket</Link>
                        <Link to="/wallet" onClick={closeMenu}>Wallet</Link>
                        <Link to="/tracking" onClick={closeMenu}>Train Tracking</Link>
                        {notificationLink}
                    </>
                )}

                {user?.role === "admin" && (
                    <>
                        <Link to="/admin" onClick={closeMenu}>Admin Dashboard</Link>
                        <Link to="/tracking" onClick={closeMenu}>Train Tracking</Link>
                        {notificationLink}
                    </>
                )}

                {user && (
                    <div className="flex items-center gap-3 bg-white text-blue-950 px-4 py-2 rounded">
                        <span className="font-bold">{user.name}</span>
                        <span className="bg-cyan-500 text-white px-3 py-1 rounded text-sm font-bold">
                            {roleLabel}
                        </span>
                    </div>
                )}

                {!user ? (
                    <>
                        <Link to="/login" onClick={closeMenu}>Login</Link>
                        <Link to="/admin-login" onClick={closeMenu}>Admin Login</Link>
                        <Link
                            to="/register"
                            onClick={closeMenu}
                            className="bg-cyan-500 px-4 py-2 rounded"
                        >
                            Register
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={logout}
                        className="bg-red-600 px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
