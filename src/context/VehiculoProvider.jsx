import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const VehiculoContext = createContext();

const VehiculoProvider = ({ children }) => {
    




    

    return (
        <VehiculoContext.Provider value={{ }}>
            {children}
        </VehiculoContext.Provider>
    );
};


export { VehiculoProvider };
export default VehiculoContext;
