import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function OtpSetup() {
    const { state } = useLocation();
    const userId = state.userId;

    const [qr, setQr] = useState(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/api/otp/setup/`, {
            method: "POST",
            credentials: "include", // send cookies!
        })
        .then(res => res.json())
        .then(data => setQr(data.qr_image));
    }, []);

    const handleActivate = async () => {
        const res = await fetch(`${API_URL}/api/otp/activate/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token }),
        });

        if (res.ok) {
            alert("OTP activated!");
            window.location.href = "/"; // back to login, or dashboard
        } else {
            alert("Invalid code");
        }
    };

    return (
        <div>
            <h2>Scan QR</h2>
            {qr && <img src={qr} />}
            <input
                placeholder="Enter code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />
            <button onClick={handleActivate}>Activate</button>
        </div>
    );
}
