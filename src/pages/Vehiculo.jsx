import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


const Vehiculo = () => {

      /// extrayendo la información para la autenticación
  const { auth, loading } = useAuth();
  if (loading == true) return 'Cargando...';

    return (
        <div>
            <h2>Carros</h2>

        </div>
    );
};


export default Vehiculo;
