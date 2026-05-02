import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import clienteAxios from "../../config/axios.jsx";
import styles from "./login.module.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { token: tokenParam } = useParams();
  const token = useMemo(() => tokenParam || searchParams.get("token") || "", [tokenParam, searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add(styles.loginBody);
    return () => document.body.classList.remove(styles.loginBody);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({ title: "Token inválido", text: "No se encontró token en la URL.", icon: "error" });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({ title: "Error", text: "Las contraseñas no coinciden.", icon: "error" });
      return;
    }

    try {
      await clienteAxios.post("/reset-password", { token, password });
      Swal.fire({
        title: "Contraseña actualizada",
        text: "Ya puedes iniciar sesión con tu nueva contraseña.",
        icon: "success",
      }).then(() => navigate("/login"));
    } catch (_error) {
      Swal.fire({
        title: "No se pudo restablecer",
        text: "El token es inválido o ya expiró.",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <div className={styles.brandSection}>
          <div className={styles.logoIcon}></div>
          <h3 className={styles.title}>ANTIOCAR</h3>
          <p className={styles.subtitle}>Nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`${styles.field} ${password ? styles.hasValue : ""}`}>
            <input
              autoComplete="off"
              placeholder="Nueva contraseña"
              className={styles.inputField}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className={`${styles.field} ${confirmPassword ? styles.hasValue : ""}`}>
            <input
              autoComplete="off"
              placeholder="Confirmar contraseña"
              className={styles.inputField}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className={styles.btn} type="submit">
            Guardar contraseña
          </button>

          <Link to="/login" className={styles.btnLink}>
            Volver a iniciar sesión
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
