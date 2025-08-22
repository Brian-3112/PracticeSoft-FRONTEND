import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';



export const RentaContext = createContext();

export const RentaProvider = ({ children }) => {

    const { auth, config } = useAuth();
    //se guarda la info de las rentas que se trae del cosultar
    const [rentas, setRentas] = useState([]);


    





    return (
        <RentaProvider.Provider value={{ rentas  }}>
            {children}
        </RentaProvider.Provider>
    );
};



RentaProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
