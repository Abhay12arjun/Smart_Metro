import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import GoogleAuthButton from "../components/GoogleAuthButton";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const saveSession = (data) => {
        localStorage.setItem("metroToken", data.token);
        localStorage.setItem("metroUser", JSON.stringify(data.user));

        navigate("/passenger");
        window.location.reload();
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/auth/register", form);

            saveSession(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <form
                onSubmit={submitHandler}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-3xl font-bold mb-5 text-center">Passenger Register</h2>

                {error && (
                    <p className="bg-red-100 text-red-600 p-3 mb-3 rounded">
                        {error}
                    </p>
                )}

                <input
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="Full Name"
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="Email"
                    type="email"
                    required
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    className="border p-3 w-full mb-3 rounded"
                    placeholder="Password"
                    type="password"
                    required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button className="bg-blue-950 text-white p-3 w-full rounded">
                    Register
                </button>

                <GoogleAuthButton
                    onAuthSuccess={saveSession}
                    setError={setError}
                    text="signup_with"
                />

                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-700 font-bold">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Register;
