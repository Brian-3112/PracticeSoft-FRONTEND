import { useContext } from 'react';
import { ClienteContext } from '../context/ClienteProvider'; // ← ajusta la importación

const useCliente = () => {
    return useContext(ClienteContext);
};

export default useCliente;