import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const saveSession = (data) => {
        localStorage.setItem("metroToken", data.token);
        localStorage.setItem("metroUser", JSON.stringify(data.user));

        navigate(data.user.role === "admin" ? "/admin" : "/passenger");
        window.location.reload();
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/auth/login", form);

            saveSession(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submitHandler}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-3xl font-bold mb-5 text-center">Passenger Login</h2>

                {error && (
                    <p className="bg-red-100 text-red-600 p-3 mb-3 rounded">
                        {error}
                    </p>
                )}

                <input
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="Email"
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

                <div className="text-right mb-4">
                    <Link to="/forgot-password" className="text-blue-700 font-bold">
                        Forgot password?
                    </Link>
                </div>

                <button className="bg-blue-950 text-white p-3 w-full rounded">
                    Login
                </button>

                <GoogleAuthButton
                    onAuthSuccess={saveSession}
                    setError={setError}
                    text="signin_with"
                />

                <p className="mt-4 text-center">
                    New user?{" "}
                    <Link to="/register" className="text-blue-700 font-bold">
                        Register
                    </Link>
                </p>

                <p className="mt-2 text-center">
                    Admin?{" "}
                    <Link to="/admin-login" className="text-blue-700 font-bold">
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
