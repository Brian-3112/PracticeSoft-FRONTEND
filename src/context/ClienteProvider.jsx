import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

export const ClienteContext = createContext(); // <-- cambia esto

export const ClienteProvider = ({ children }) => {
    const { auth, config } = useAuth();



    return (
        <ClienteContext.Provider value={{  }}>
            {children}
        </ClienteContext.Provider>
    );
};

ClienteProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
