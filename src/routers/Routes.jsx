// src/routers/Routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login/Login';
import RestablecerContrasena from '../pages/Login/RestablecerContrasena';
import ResetPassword from '../pages/Login/ResetPassword';
import Navegador from '../Layout/Navegador';
import Dashboard from '../pages/Dashboard/Dashboard';
import Vehiculo from '../pages/Vehiculo/Vehiculo';
import Cliente from '../pages/Cliente/Cliente';
import Renta from '../pages/Renta/Renta';
import Disponibilidad from '../pages/Disponibilidad/Disponibilidad';
import Configuracion from '../pages/Configuracion/Configuracion';
import { AuthProvider } from '../context/AuthProvider';
import { VehiculoProvider } from '../context/VehiculoProvider';
import { ClienteProvider } from '../context/ClienteProvider';
import { RentaProvider } from '../context/RentaProvider';
import { DashboardProvider } from '../context/DashboardProvider';



const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <VehiculoProvider>
                    <ClienteProvider>
                        <DashboardProvider>
                            <RentaProvider>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/login" />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/restablecer-password" element={<RestablecerContrasena />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />







                                    {/* Rutas protegidas */}
                                    <Route element={<ProtectedRoute />}>

                                        <Route
                                            path="/admin"
                                            element={<Navegador />}
                                        >

                                            <Route index element={<Navigate to="disponibilidad" replace />} />

                                            <Route path="disponibilidad" element={<Disponibilidad />} />

                                            <Route path="dashboard" element={<Dashboard />} />

                                            <Route path="vehiculos" element={<Vehiculo />} />

                                            <Route path="clientes" element={<Cliente />} />

                                            <Route path="rentas" element={<Renta />} />

                                            <Route path="configuracion" element={<Configuracion />} />





                                        </Route>
                                    </Route>



                                </Routes>
                            </RentaProvider>
                        </DashboardProvider>
                    </ClienteProvider>
                </VehiculoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
