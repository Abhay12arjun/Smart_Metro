import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function AdminLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/auth/admin/login", form);

            localStorage.setItem("metroToken", res.data.token);
            localStorage.setItem("metroUser", JSON.stringify(res.data.user));

            navigate("/admin");
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || "Admin login failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submitHandler}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-3xl font-bold mb-5 text-center">Admin Login</h2>

                {error && (
                    <p className="bg-red-100 text-red-600 p-3 mb-3 rounded">
                        {error}
                    </p>
                )}

                <input
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="Admin Email"
                    type="email"
                    required
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    className="border p-3 w-full mb-4 rounded"
                    placeholder="Password"
                    type="password"
                    required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button className="bg-blue-950 text-white p-3 w-full rounded">
                    Login as Admin
                </button>

                <p className="mt-4 text-center">
                    Passenger?{" "}
                    <Link to="/login" className="text-blue-700 font-bold">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default AdminLogin;
