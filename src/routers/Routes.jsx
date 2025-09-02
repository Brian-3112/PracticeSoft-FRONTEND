// src/routers/Routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login/Login';
import Navegador from '../Layout/Navegador';
import Dashboard from '../pages/Dashboard';
import Vehiculo from '../pages/Vehiculo/Vehiculo';
import Cliente from '../pages/Cliente/Cliente';
import Renta from '../pages/Renta/Renta';
import { AuthProvider } from '../context/AuthProvider';
import { VehiculoProvider } from '../context/VehiculoProvider';
import { ClienteProvider } from '../context/ClienteProvider';
import { RentaProvider } from '../context/RentaProvider';


const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <VehiculoProvider>
                    <ClienteProvider>
                        <RentaProvider>
                            <Routes>
                                <Route path="/" element={<Navigate to="/login" />} />
                                <Route path="/login" element={<Login />} />


                                <Route
                                    path="/admin"
                                    element={<Navegador />}
                                >

                                    <Route index element={<Dashboard />} />

                                    <Route path="vehiculos" element={<Vehiculo />} />

                                    <Route path="clientes" element={<Cliente />} />

                                    <Route path="rentas" element={<Renta />} />





                                </Route>




                                {/* Rutas protegidas */}
                                <Route element={<ProtectedRoute />}>

                                    {/* Puedes agregar más rutas protegidas aquí en el futuro */}
                                    {/* <Route path="/admin" element={<AdminPanel />} /> */}
                                </Route>



                            </Routes>
                        </RentaProvider>
                    </ClienteProvider>
                </VehiculoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
