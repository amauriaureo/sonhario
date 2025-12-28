import { Navigate, Outlet } from 'react-router-dom';

// Componente para proteger rotas
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Se o token existe, permite o acesso à rota. Caso contrário, redireciona para o login.
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;

