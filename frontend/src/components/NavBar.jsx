import { useNavigate, Link } from "react-router-dom";

function NavBar({ logged, setLogged }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setLogged(false);
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
            <div className="container-fluid d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-house-heart" viewBox="0 0 16 16">
                        <path d="M8 6.982C9.664 5.309 13.825 8.236 8 12 2.175 8.236 6.336 5.309 8 6.982" />
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.707L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.646a.5.5 0 0 0 .708-.707L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                    </svg>
                    <h1 className="fs-4 text-white ms-2 mb-0">ADM-Props</h1>
                </div>
                {logged && (
                    <>
                        <div className="d-flex flex-grow-1 justify-content-evenly">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/agenda">
                                        AGENDA
                                    </Link>
                                </li>
                            </ul>
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link className="nav-link text-white" to="/propiedad">
                                        PROPIEDADES
                                    </Link>
                                </li>
                            </ul>
                            <ul className="navbar-nav">
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle text-white" href="" id="parametersDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">PARÁMETROS</a>
                                    <ul className="dropdown-menu bg-light" aria-labelledby="parametersDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/propietario">Propietarios</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/inquilino">Inquilinos</Link>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <Link className="dropdown-item" to="/tipo_de_propiedad">Tipos de propiedades</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/tipo_de_impuesto">Tipos de impuestos</Link>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="dropdown">
                            <button className="btn btn-primary dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" >
                                <i className="bi bi-person-circle me-2"></i>Usuario
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li>
                                    <Link className="dropdown-item" to="/profile">
                                        Perfil
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;