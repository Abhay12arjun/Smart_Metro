import { GoogleLogin } from "@react-oauth/google";
import API from "../api/axios";

function GoogleAuthButton({ onAuthSuccess, setError, text = "signin_with" }) {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const successHandler = async (credentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                setError("Google did not return a login credential");
                return;
            }

            const res = await API.post("/auth/google", {
                credential: credentialResponse.credential
            });

            onAuthSuccess(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Google authentication failed");
        }
    };

    if (!googleClientId) {
        return (
            <p className="mt-4 rounded bg-yellow-100 p-3 text-center text-sm text-yellow-800">
                Add your Google Client ID in frontend/.env and backend/.env to enable Google login.
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
