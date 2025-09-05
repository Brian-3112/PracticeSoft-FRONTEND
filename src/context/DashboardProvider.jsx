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



  const calcularDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 👀 Corrección: axios devuelve "data", no "dataClientes" o "dataRentas"
      const { data: clientes } = await clienteAxios.get("/clientes", config);
      const { data: rentas } = await clienteAxios.get("/rentas", config);

      // Total de clientes
      setClientesTotal(clientes.length);

      // Ingresos del mes actual (usando fechaEntrega y valorTotal)
      const mesActual = new Date().getMonth();
      const totalMes = rentas
        .filter(r => new Date(r.fechaEntrega).getMonth() === mesActual)
        .reduce((acc, r) => acc + r.valorTotal, 0);
      setIngresosMes(totalMes);

      // Ingresos por mes (array de 12 posiciones)
      const ingresosArray = Array(12).fill(0);
      rentas.forEach(r => {
        const mes = new Date(r.fechaEntrega).getMonth();
        ingresosArray[mes] += r.valorTotal;
      });
      setIngresosPorMes(ingresosArray);

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
    <DashboardContext.Provider value={{ ingresosMes, clientesTotal, ingresosPorMes }}>
      {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
