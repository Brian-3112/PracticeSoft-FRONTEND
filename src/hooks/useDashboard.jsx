import { useContext } from 'react';
import { DashboardContext } from '../context/DashboardProvider'; // ← ajusta la importación

const useDashboard = () => {
    return useContext(DashboardContext);
};

export default useDashboard;