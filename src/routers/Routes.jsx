// src/routers/Routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Navegador from '../Layout/Navegador';
import Dashboard from '../pages/Dashboard';
import Vehiculo from '../pages/Vehiculo';
import { AuthProvider } from '../context/AuthProvider';
import { VehiculoProvider } from '../context/VehiculoProvider';
import ProtectedRoute from './ProtectedRoute';

const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
            <VehiculoProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />


                    <Route
                        path="/admin"
                        element={<Navegador />}
                    >

                        <Route index element={<Dashboard />} />

                        <Route path="vehiculo" element={<Vehiculo />} />





                    </Route>




                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>

                        {/* Puedes agregar más rutas protegidas aquí en el futuro */}
                        {/* <Route path="/admin" element={<AdminPanel />} /> */}
                    </Route>



                </Routes>
                </VehiculoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
