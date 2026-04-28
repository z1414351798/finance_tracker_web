import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  // If not authenticated, redirect to login page
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}