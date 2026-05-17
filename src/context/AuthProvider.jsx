import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/generalCss.css';
import Swal from 'sweetalert2';
import { getUserFromAuthPayload, getNormalizedAllowedModules } from '../utils/moduleAccess';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };


    //! Este use effect Para que cuando carge la app revisar si el usuario esta autenticado o no
    useEffect(() => {
        const autenticarUsuario = async () => {
            //  revisa si hay un token en localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            try {
                const { data } = await clienteAxios.get('/usuarios', config);
                const normalizedUser = getUserFromAuthPayload(data);
                console.debug('[Auth Init]', { role: normalizedUser?.role, isTemporary: normalizedUser?.isTemporary, allowedModules: getNormalizedAllowedModules(normalizedUser) });
                setAuth(normalizedUser);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.data?.message === "Token no valido") {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                setAuth({});
            }
            setLoading(false);
        };
        autenticarUsuario();
    }, [navigate]);


    const cerrarSesion = () => {
        Swal.fire({
            title: "¿Deseas cerrar la sesión?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            customClass: {
                confirmButton: 'confirmarBoton', // <- clase personalizada aquí
                cancelButton: 'cancelBoton'
            }
        }).then(result => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                setAuth({});
                navigate('/login');
            }
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading, cerrarSesion, config }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthProvider };
export default AuthContext;
