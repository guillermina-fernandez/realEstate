import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Crud from './pages/Crud'
import { DataProvider } from './context/DataContext'
import RealEstate from './pages/RealEstate'
import NavBar from './components/NavBar'
import Agenda from './pages/Agenda'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import OtpPage from './pages/OtpPage'
import OtpSetup from './pages/OtpPage'
import OtpVerify from './pages/OtpVerify'
import { isTokenExpired, refreshAccessToken } from './services/api_utils'

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
        try {
          await refreshAccessToken();
          setLogged(true);
        } catch {
          setLogged(false);
        }
      } else {
        setLogged(true);
      }
    };

    checkAuth();

    // Check every minute instead of every 10 minutes
    refreshInterval = setInterval(async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      if (!access || !refresh) {
        clearInterval(refreshInterval);
        setLogged(false);
        return;
      }

      try {
        const [, payload] = access.split('.');
        const decoded = JSON.parse(atob(payload));
        const now = Date.now() / 1000;
        const timeLeft = decoded.exp - now;

        // Refresh when less than 5 minutes left
        if (timeLeft < 300) {
          await refreshAccessToken();
        }
      } catch {
        clearInterval(refreshInterval);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setLogged(false);
      }
    }, 1000 * 60); // Check every 1 minute

    // Activity-based token refresh
    const handleActivity = async () => {
      const access = localStorage.getItem("access");
      if (access && isTokenExpired(access)) {
        try {
          await refreshAccessToken();
          setLogged(true);
        } catch {
          setLogged(false);
        }
      }
    };

    // Refresh on user activity (debounced via the isTokenExpired check)
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);

    const syncAuth = () => setLogged(!!localStorage.getItem("access"));
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(refreshInterval);
    };
  }, []);

  function NotFound() {
    return (
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg mt-4">Página no encontrada</p>
      </div>
    );
  }

  return (
    <main>
      <NavBar logged={logged} setLogged={setLogged} />
      <Routes>
        <Route path='/' element={
          logged ? (
            <Navigate to='/agenda' replace />
          ) : (
            <Login />
          )
        } />
        <Route path="*" element={<NotFound />} />
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