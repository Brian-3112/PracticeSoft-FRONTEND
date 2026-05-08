import { useState } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth.jsx';
import { changeUserPassword } from '../../services/userSettingsService.js';
import styles from './Configuracion.module.css';

const getUserFromAuth = (auth = {}) => {
  if (auth?.usuario && typeof auth.usuario === 'object') return auth.usuario;
  if (auth?.user && typeof auth.user === 'object') return auth.user;
  if (auth?.data?.usuario && typeof auth.data.usuario === 'object') return auth.data.usuario;
  if (auth?.data && typeof auth.data === 'object') return auth.data;
  return auth;
};

const getValue = (value) => {
  const normalizedValue = String(value ?? '').trim();
  return normalizedValue || 'No registrado';
};

const getInitials = (nombre = '', apellido = '') => {
  const fullName = `${nombre} ${apellido}`.trim();
  const words = fullName.split(/\s+/).filter(Boolean);
  if (!words.length) return 'US';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
};

const Configuracion = () => {
  const { auth, config } = useAuth();
  const user = getUserFromAuth(auth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nombre = user?.nombre ?? user?.name ?? '';
  const apellido = user?.apellido ?? user?.lastName ?? user?.lastname ?? '';
  const correo = user?.correo ?? user?.email ?? '';
  const userName = `${String(nombre ?? '').trim()} ${String(apellido ?? '').trim()}`.trim() || 'Usuario';
  const initials = getInitials(nombre, apellido);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({ title: 'Error', text: 'La nueva contraseña y la confirmación no coinciden.', icon: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({ title: 'Contraseña muy corta', text: 'La nueva contraseña debe tener mínimo 6 caracteres.', icon: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      await changeUserPassword({ currentPassword, newPassword }, config);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Swal.fire({ title: 'Contraseña actualizada', text: 'Tu contraseña fue cambiada correctamente.', icon: 'success' });
    } catch (error) {
      Swal.fire({
        title: error.title,
        text: `${error.message} ${error.detail}`,
        icon: 'error',
      });
      console.error('Error cambiar-password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.hero}>
        <article className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <h3 className={styles.profileName}>{userName}</h3>
              <p className={styles.profileSubtitle}>Información de la cuenta autenticada</p>
            </div>
          </div>

          <h4 className={styles.sectionTitle}>Datos del usuario</h4>
          <p className={styles.sectionText}>Consulta tus datos principales. La contraseña no se muestra por seguridad, pero puedes actualizarla desde esta misma sección.</p>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nombre</span>
              <p className={styles.infoValue}>{getValue(nombre)}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Apellido</span>
              <p className={styles.infoValue}>{getValue(apellido)}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Correo</span>
              <p className={styles.infoValue}>{getValue(correo)}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contraseña</span>
              <p className={styles.infoValue}>••••••••</p>
            </div>
          </div>
        </article>

        <aside className={styles.securityBox}>
          <div className={styles.securityIcon} aria-hidden="true">🔐</div>
          <h4 className={styles.securityTitle}>Seguridad de cuenta</h4>
          <p className={styles.securityText}>Usa una contraseña diferente a la anterior y evita compartirla. Después de guardar, deberás usar la nueva contraseña en el próximo inicio de sesión.</p>
        </aside>
      </div>

      <article className={styles.passwordCard}>
        <h4 className={styles.sectionTitle}>Cambiar contraseña</h4>
        <p className={styles.sectionText}>Ingresa tu contraseña actual y confirma la nueva contraseña para proteger tu cuenta.</p>

        <form className={styles.passwordForm} onSubmit={handleSubmit}>
          <label className={styles.formGroup}>
            <span className={styles.formLabel}>Contraseña actual</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label className={styles.formGroup}>
            <span className={styles.formLabel}>Nueva contraseña</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <small className={styles.helpText}>Mínimo 6 caracteres.</small>
          </label>

          <label className={styles.formGroup}>
            <span className={styles.formLabel}>Confirmar nueva contraseña</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </article>
    </section>
  );
};

export default Configuracion;
