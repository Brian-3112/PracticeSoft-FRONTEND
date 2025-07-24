import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import '../GeneralCSS/generalCss.css';
import Swal from 'sweetalert2';

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
