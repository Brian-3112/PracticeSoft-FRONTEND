// src/routers/Routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import Navegador from '../Layout/Navegador';
import Dashboard from '../pages/Dashboard';
import Vehiculo from '../pages/Vehiculo';
import Cliente from '../pages/Cliente';
import { AuthProvider } from '../context/AuthProvider';
import { VehiculoProvider } from '../context/VehiculoProvider';
import { ClienteProvider } from '../context/ClienteProvider';


const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <VehiculoProvider>
                    <ClienteProvider>
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





                            </Route>




                            {/* Rutas protegidas */}
                            <Route element={<ProtectedRoute />}>

                                {/* Puedes agregar más rutas protegidas aquí en el futuro */}
                                {/* <Route path="/admin" element={<AdminPanel />} /> */}
                            </Route>



                        </Routes>
                    </ClienteProvider>
                </VehiculoProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
