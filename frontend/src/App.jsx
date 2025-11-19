import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Crud from './pages/Crud'
import { DataProvider } from './context/DataContext'
import RealEstate from './pages/RealEstate'
import NavBar from './components/NavBar'
import Agenda from './pages/Agenda'
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import OtpPage from './pages/OtpPage'
import OtpSetup from './pages/OtpPage'
import OtpVerify from './pages/OtpVerify'


function isTokenExpired(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
}


async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();
    localStorage.setItem("access", data.access);
    return true;
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return false;
  }
}


function PrivateRoute({ logged, children }) {
  return logged ? children : <Navigate to="/" replace />;
}

function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem('access'));
  const crudRoutes = [
    { path: '/propietario', modelName: 'propietario', modelDepth: 0, modelId: null, relatedModel: null, relatedModelDepth: null, relatedFieldName: null },
    { path: '/inquilino', modelName: 'inquilino', modelDepth: 0, modelId: null, relatedModel: null, relatedModelDepth: null, relatedFieldName: null },
    { path: '/tipo_de_propiedad', modelName: 'tipo_de_propiedad', modelDepth: 0, modelId: null, relatedModel: null, relatedModelDepth: null, relatedFieldName: null },
    { path: '/propiedad', modelName: 'propiedad', modelDepth: 0, modelId: null, relatedModel: null, relatedModelDepth: null, relatedFieldName: null },
    { path: '/tipo_de_impuesto', modelName: 'tipo_de_impuesto', modelDepth: 0, modelId: null, relatedModel: null, relatedModelDepth: null, relatedFieldName: null },
  ]

  useEffect(() => {
    let refreshInterval;

    const checkAuth = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      if (!access || !refresh) {
        setLogged(false);
        return;
      }

      if (isTokenExpired(access)) {
        const refreshed = await refreshAccessToken();
        setLogged(refreshed);
      } else {
        setLogged(true);
      }
    };

    checkAuth();

    refreshInterval = setInterval(async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      if (!access || !refresh) {
        clearInterval(refreshInterval);
        return;
      }

      try {
        const [, payload] = access.split('.');
        const decoded = JSON.parse(atob(payload));
        const now = Date.now() / 1000;
        const timeLeft = decoded.exp - now;

        if (timeLeft < 120) {
          await refreshAccessToken();
        }
      } catch {
        clearInterval(refreshInterval);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setLogged(false);
      }
    }, 1000 * 60 * 10);

    const syncAuth = () => setLogged(!!localStorage.getItem("access"));
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <main>
      <NavBar logged={logged} setLogged={setLogged}/>
      <Routes>
        <Route path='/' element={
          logged ? (
            <Navigate to='/agenda' replace />
          ) : (
            <Login />
          )
        } />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/otp-setup" element={<OtpSetup />} />
        <Route path="/otp-verify" element={<OtpVerify />} />
        {crudRoutes.map(({ path, modelName, modelDepth, modelId, relatedModel, relatedModelDepth, relatedFieldName }) => (
          <Route key={modelName} path={path} element={
            <PrivateRoute logged={logged}>
              <DataProvider modelName={modelName} modelDepth={modelDepth} modelId={modelId} relatedModel={relatedModel} relatedModelDepth={relatedModelDepth} relatedFieldName={relatedFieldName}>
                <Crud />
              </DataProvider>
            </PrivateRoute>
          }
          />
        ))}
        <Route path="/propiedad/:obj_id" element={
          <PrivateRoute logged={logged}>
            <DataProvider modelName='propiedad' modelDepth='0' modelId={null} relatedModel={null} relatedModelDepth={null} relatedFieldName={null}>
              <RealEstate />
            </DataProvider>
          </PrivateRoute>
        } />
        <Route path="/agenda" element={
          <PrivateRoute logged={logged}>
            <DataProvider modelName='agenda' modelDepth='0' modelId={null} relatedModel={null} relatedModelDepth={null} relatedFieldName={null}>
              <Agenda />
            </DataProvider>
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer />
    </main>
  )
}

export default App

