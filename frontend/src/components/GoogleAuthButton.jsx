import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function GoogleAuthButton({ onAuthSuccess, setError, text = "signin_with" }) {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const navigate = useNavigate();

    const successHandler = async (credentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                setError("Google did not return a login credential");
                return;
            }

            const res = await API.post("/auth/google", {
                credential: credentialResponse.credential,
            });

            // Save token/user if backend returns them
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
            }

            if (res.data?.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }

            // Send data to parent component
            if (onAuthSuccess) {
                onAuthSuccess(res.data);
            }

            // Redirect based on role
            const role = res.data?.user?.role || res.data?.role;

            if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/passenger");
            }
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(err.response?.data?.message || "Google authentication failed");
        }
    };

    if (!googleClientId) {
        return (
            <p className="mt-4 rounded bg-yellow-100 p-3 text-center text-sm text-yellow-800">
                Add your Google Client ID in frontend/.env and Render Environment to enable Google login.
            </p>
        );
    }

    return (
        <div className="mt-4 flex justify-center">
            <GoogleLogin
                onSuccess={successHandler}
                onError={() => setError("Google authentication failed")}
                text={text}
                shape="rectangular"
                width="320"
            />
        </div>
    );
}

export default GoogleAuthButton;