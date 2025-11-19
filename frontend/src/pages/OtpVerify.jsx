import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function OtpVerify() {
    const { state } = useLocation();
    const userId = state.userId;
    const [token, setToken] = useState("");

    const handleVerify = async () => {
        const res = await fetch("http://127.0.0.1:8000/api/otp/verify/", {
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
            <button onClick={handleVerify}>Verify</button>
        </div>
    );
}
