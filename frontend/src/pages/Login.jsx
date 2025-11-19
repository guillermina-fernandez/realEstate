import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";


function Login({ setLogged, setIsLoading }) {
    const [passType, setPassType] = useState('password');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const togglePass = () => {
        passType === 'password' ? setPassType('text') : setPassType('password');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.error || "Usuario o Contraseña incorrectos.");
                return;
            }

            const data = await res.json();
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            setLogged(true);
            navigate("/home");
        } catch (error) {
            toast.error('Error de Conexión.');
        }
    };

    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <div className="d-flex flex-column align-items-center">
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
                        <form className="border border-5 border-primary mx-5 my-5 p-5 w-auto" onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label htmlFor="username">Usuario</label>
                                <input type="text" className="form-control" id="username" name="username" onChange={(e) => setUsername(e.target.value)} required autoFocus />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password">Contraseña</label>
                                <div className="input-group">
                                    <input type={passType} className="form-control" id="password" name="password" onChange={(e) => setPassword(e.target.value)} required />
                                    <button type="button" className="btn btn-outline-secondary" aria-label="Ver Contraseña" onClick={togglePass} tabIndex={"-1"}>
                                        <i className="bi bi-eye-fill"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="row mt-4 mb-4">
                                <div className="col d-flex justify-content-center">
                                    <p>Olvidé mi Contraseña</p>
                                </div>
                            </div>

                            <div className="w-100">
                                <button type="submit" className="btn btn-primary btn-block mb-4 w-100">
                                    INGRESAR
                                </button>
                            </div>
                            <div className="text-center">
                                <p>No posee usuario? Contacte al Administrador</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;