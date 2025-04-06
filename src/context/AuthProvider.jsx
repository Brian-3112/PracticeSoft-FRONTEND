import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const autenticarUsuario = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await clienteAxios.get('/usuarios/login', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAuth(data);
            } catch (error) {
                if (error.response?.data?.message === "Token no valido") {
                    cerrarSesion();
                }
                setAuth({});
            }

            setLoading(false);
        };

        autenticarUsuario();
    }, []);

    const cerrarSesion = () => {
        Swal.fire({
            title: "¿Deseas cerrar la sesión?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
        }).then(result => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                setAuth({});
                navigate('/login');
            }
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthProvider };
export default AuthContext;
