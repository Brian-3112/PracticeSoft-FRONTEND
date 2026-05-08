// src/context/DashboardProvider.jsx
import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';


export const DashboardContext = createContext();

const parseDateOnly = (dateValue) => {
    if (!dateValue) return null;
    const dateString = String(dateValue).slice(0, 10);
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const DashboardProvider = ({ children }) => {


    const { auth, config } = useAuth();
    const [ingresosMes, setIngresosMes] = useState(0);
    const [clientesTotal, setClientesTotal] = useState(0);
    const [ingresosPorMes, setIngresosPorMes] = useState([]);
    const [rentas, setRentas] = useState([]);
    const [ingresosAnual, setIngresosAnual] = useState(0);



    
    const recalcularDesdeRentas = (rentasFuente) => {
        const mesActual = new Date().getMonth();

        const totalMes = rentasFuente
            .filter((r) => parseDateOnly(r.fechaEntrega)?.getMonth() === mesActual)
            .reduce((acc, r) => acc + Number(r.valorTotal || 0), 0);
        setIngresosMes(totalMes);

        const ingresosArray = Array(12).fill(0);
        rentasFuente.forEach((r) => {
            const fechaEntrega = parseDateOnly(r.fechaEntrega);
            if (!fechaEntrega) return;
            const mes = fechaEntrega.getMonth();
            ingresosArray[mes] += Number(r.valorTotal || 0);
        });
        setIngresosPorMes(ingresosArray);
        setIngresosAnual(ingresosArray.reduce((acc, val) => acc + val, 0));
    };

    const aplicarRentaLocal = (rentaNueva) => {
        if (!rentaNueva) return;
        setRentas((prev) => {
            const nextRentas = [rentaNueva, ...prev];
            recalcularDesdeRentas(nextRentas);
            return nextRentas;
        });
    };

const calcularDashboard = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data: clientes } = await clienteAxios.get("/clientes", config); //guardamos los clientes
            const { data: rentasData } = await clienteAxios.get("/rentas", config); //guardamos las rentas



            // Cantidad de clientes
            setClientesTotal(clientes.length);

            setRentas(rentasData); //guardamos las rentas
            recalcularDesdeRentas(rentasData);



        } catch (error) {
            console.error("Error al calcular dashboard:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo cargar el dashboard",
                icon: "error",
            });
        }

    };
    useEffect(() => {
        if (auth) {
            calcularDashboard();
        }
    }, [auth]);




    return (
        <DashboardContext.Provider value={{ ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual, calcularDashboard, aplicarRentaLocal }}>
            {children}
        </DashboardContext.Provider>
    );
};

DashboardProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
