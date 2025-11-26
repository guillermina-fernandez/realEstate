import { useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function OtpVerify() {
    const { state } = useLocation();
    const userId = state.userId;
    const [token, setToken] = useState("");

    const handleVerify = async () => {
        const res = await fetch(`${API_URL}/api/otp/verify/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, token }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            window.location.href = "/agenda";
        } else {
            alert("Invalid code");
        }
    };

    return (
        <div>
            <h2>Enter OTP code</h2>
            <input value={token} onChange={(e)=>setToken(e.target.value)} />
            <button className="ms-3" onClick={handleVerify}>Verify</button>
        </div>
    );
}
