import { Link } from "react-router-dom";

function NavBar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
            <div className="container-fluid d-flex flex-wrap">
                <ul className="navbar-nav me-auto mb-lg-0 hstack">
                    <li className="nav-item">
                        <Link className="nav-link" to="/agenda">AGENDA</Link>
                    </li>
                </ul>
                <ul className="navbar-nav me-auto mb-lg-0 hstack">
                    <li className="nav-item">
                        <Link className="nav-link" to="/propiedad">PROPIEDADES</Link>
                    </li>
                </ul>
                <ul className="navbar-nav me-auto mb-lg-0 hstack">
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="" id="parametersDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">PARÁMETROS</a>
                        <ul className="dropdown-menu" aria-labelledby="parametersDropdown">
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
        </nav>
    );
}

export default NavBar;