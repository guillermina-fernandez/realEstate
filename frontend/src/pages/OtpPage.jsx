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
            credentials: "include",
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

        // ✅ CHANGED THIS SECTION
        if (res.ok) {
            const data = await res.json();  // ✅ Parse response

            // ✅ Store JWT tokens
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            alert("OTP activated!");
            window.location.href = "/agenda";  // ✅ Changed from "/" to "/agenda"
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