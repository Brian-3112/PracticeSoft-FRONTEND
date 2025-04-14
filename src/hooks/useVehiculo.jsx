import { useContext } from "react"
import VehiculoContext from "../context/VehiculoProvider"

const useVehiculo = () => {
    return useContext(VehiculoContext)
}

export default useVehiculo