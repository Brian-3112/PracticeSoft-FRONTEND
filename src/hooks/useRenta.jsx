import { useContext } from 'react';
import { RentaContext } from '../context/RentaProvider'; // ← ajusta la importación

const useRenta = () => {
    return useContext(RentaContext);
};

export default useRenta;
