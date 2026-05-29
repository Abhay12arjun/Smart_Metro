import { useState } from "react";
import API from "../api/axios";

const loadRazorpayCheckout = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function Wallet() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("metroUser") || "null"));
    const [amount, setAmount] = useState("100");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const addMoney = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const walletAmount = Math.round(Number(amount));

        if (!walletAmount || walletAmount < 1) {
            setError("Enter a valid amount.");
            return;
        }

        setLoading(true);

        try {
            const isLoaded = await loadRazorpayCheckout();

            if (!isLoaded) {
                setError("Unable to load Razorpay. Please check your connection.");
                return;
            }

            const orderRes = await API.post("/wallet/razorpay/order", {
                amount: walletAmount
            });

            const order = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Smart Metro",
                description: "Wallet top-up",
                order_id: order.orderId,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || ""
                },
                theme: {
                    color: "#172554"
                },
                handler: async (response) => {
                    try {
                        const verifyRes = await API.post("/wallet/razorpay/verify", response);
                        const updatedUser = {
                            ...user,
                            ...verifyRes.data.user,
                            walletBalance: verifyRes.data.walletBalance
                        };

                        localStorage.setItem("metroUser", JSON.stringify(updatedUser));
                        setUser(updatedUser);
                        setSuccess(`₹${walletAmount} added to wallet successfully.`);
                    } catch (err) {
                        setError(err.response?.data?.message || "Payment verification failed.");
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", (response) => {
                setError(response.error?.description || "Payment failed.");
                setLoading(false);
            });
            razorpay.open();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create Razorpay order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-950">Wallet System</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Add money using Razorpay and use wallet balance for metro ticket booking.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.1fr]">
                    <section className="rounded-lg bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">Current Wallet Balance</p>
                        <h2 className="mt-3 text-5xl font-bold text-blue-950">
                            ₹{user?.walletBalance || 0}
                        </h2>
                        <p className="mt-5 text-sm text-gray-600">
                            Ticket fares are deducted from this balance. Cancelled ticket fares are refunded here.
                        </p>
                    </section>

                    <form onSubmit={addMoney} className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-950">Add Money</h2>

                        {error && (
                            <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mt-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <label className="mt-5 block text-sm font-semibold text-slate-700">
                            Amount
                        </label>
                        <div className="mt-2 flex rounded-lg border border-slate-300 bg-white focus-within:border-blue-950">
                            <span className="flex items-center border-r border-slate-200 px-4 font-bold text-slate-600">
                                ₹
                            </span>
                            <input
                                type="number"
                                min="1"
                                max="10000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-r-lg p-3 outline-none"
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {[100, 250, 500].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setAmount(String(value))}
                                    className="rounded border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    ₹{value}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-5 w-full rounded-lg bg-blue-950 p-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Opening Razorpay..." : "Add Money"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default Wallet;
