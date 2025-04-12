// src/routers/Routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Navegador from '../Layout/Navegador';
import { AuthProvider } from '../context/AuthProvider';
import ProtectedRoute from './ProtectedRoute';

const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />


                    <Route

                        path="/admin"
                        element={<Navegador />}
                    >



                    </Route>




                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>
                
                        {/* Puedes agregar más rutas protegidas aquí en el futuro */}
                        {/* <Route path="/admin" element={<AdminPanel />} /> */}
                    </Route>


                    
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
