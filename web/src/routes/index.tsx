import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RegistrosPage from '../pages/Registros';
import ProtectedRoute from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Redirecionamos o dashboard direto para os registros agora */}
        <Route path="/dashboard" element={<Navigate to="/registros" />} />
        <Route path="/registros" element={<RegistrosPage />} />
      </Route>
    </Routes>
  );
}