import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard'
import { AuthProvider } from '../context/AuthProvider';



const MyRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    
                    <Route path="/login" element={<Login />} />

                    <Route
                        path='/dashboard'
                        element={
                            <Dashboard />
                        }
                    >
                    </Route>


                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default MyRoutes;
