import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';



const Cliente = () => {
    
    const { auth, loading } = useAuth();
    if (loading) return 'Cargando...';




    return (
        <div >
            <p>oeeee</p>

        </div>
    );
};

export default Cliente;
