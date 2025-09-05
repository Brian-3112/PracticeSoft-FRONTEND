// src/context/DashboardProvider.jsx
import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';


export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const { auth, config } = useAuth();


    const [ingresosMes, setIngresosMes] = useState(0);
    const [clientesTotal, setClientesTotal] = useState(0);
    const [ingresosPorMes, setIngresosPorMes] = useState([]);
    const [rentas, setRentas] = useState([]);
    const [ingresosAnual, setIngresosAnual] = useState(0);



    const calcularDashboard = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data: clientes } = await clienteAxios.get("/clientes", config);
            const { data: rentasData } = await clienteAxios.get("/rentas", config);

            // Cantidad de clientes
            setClientesTotal(clientes.length);

            setRentas(rentasData); //guardamos las rentas

            // Cálculo Ingresos del mes
            const mesActual = new Date().getMonth();
            const totalMes = rentasData
                .filter(r => new Date(r.fechaEntrega).getMonth() === mesActual)
                .reduce((acc, r) => acc + r.valorTotal, 0);
            setIngresosMes(totalMes);


            // 👇 Cálculo Ingresos por mes (array)
            const ingresosArray = Array(12).fill(0);
            rentasData.forEach(r => {
                const mes = new Date(r.fechaEntrega).getMonth();
                ingresosArray[mes] += r.valorTotal;
            });
            setIngresosPorMes(ingresosArray);
            

            // 👇 cálculo Ingresos Anuales
            const totalAnual = ingresosArray.reduce((acc, val) => acc + val, 0);
            setIngresosAnual(totalAnual);



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
        <DashboardContext.Provider value={{ ingresosMes, clientesTotal, ingresosPorMes, rentas, ingresosAnual }}>
            {children}
        </DashboardContext.Provider>
    );
};

DashboardProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
