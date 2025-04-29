import { useState, useEffect } from 'react';

const Agregarvehiculo = () => {
  const { auth, loading } = useAuth();
  if (loading) return 'Cargando...';

 

  return (
    <div>
        
    </div>
  );
};

export default Agregarvehiculo;
