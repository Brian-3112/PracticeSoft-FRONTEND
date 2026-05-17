import { useState } from 'react';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth.jsx';
import { changeUserPassword } from '../../services/userSettingsService.js';
import {
  createTemporaryUser,
  getTemporaryUsers,
  updateTemporaryUserPassword,
  updateTemporaryUserStatus,
} from '../../services/temporaryUserService.js';
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
  const isAdmin = (user?.role ?? auth?.role) === 'admin';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryUsers, setTemporaryUsers] = useState([]);
  const [showTemporaryUserManager, setShowTemporaryUserManager] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempPasswordUserId, setTempPasswordUserId] = useState('');
  const [tempNewPassword, setTempNewPassword] = useState('');

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

  const handleCreateTemporaryUser = async (e) => {
    e.preventDefault();
    try {
      await createTemporaryUser({
        nombre: tempName,
        apellido: tempLastName,
        correo: tempEmail,
        password: tempPassword,
        role: 'empleado',
      }, config);
      setTempName(''); setTempLastName(''); setTempEmail(''); setTempPassword('');
      Swal.fire({ title: 'Usuario temporal creado', icon: 'success' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudo crear el usuario temporal.', icon: 'error' });
    }
  };

  const handleLoadTemporaryUsers = async () => {
    try {
      const data = await getTemporaryUsers(config);
      setTemporaryUsers(Array.isArray(data) ? data : (data?.usuarios || data?.data || []));
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudieron consultar usuarios temporales.', icon: 'error' });
    }
  };
  const handleUpdateTemporaryStatus = async (tempUser) => {
    try {
      await updateTemporaryUserStatus(tempUser.id || tempUser._id, { isActive: !(tempUser.isActive ?? tempUser.activo) }, config);
      Swal.fire({ title: 'Estado actualizado', icon: 'success' });
      handleLoadTemporaryUsers();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudo actualizar el estado del usuario temporal.', icon: 'error' });
    }
  };

  const handleUpdateTemporaryPassword = async (e) => {
    e.preventDefault();
    try {
      await updateTemporaryUserPassword(tempPasswordUserId, { password: tempNewPassword }, config);
      setTempPasswordUserId('');
      setTempNewPassword('');
      Swal.fire({ title: 'Contraseña actualizada', icon: 'success' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudo actualizar la contraseña del usuario temporal.', icon: 'error' });
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

      {isAdmin && (
        <article className={styles.passwordCard}>
          <button className={styles.submitButton} type="button" onClick={() => setShowTemporaryUserManager((prev) => !prev)}>
            {showTemporaryUserManager ? 'Ocultar gestión de usuario temporal' : 'Gestión de usuario temporal'}
          </button>

          {showTemporaryUserManager && (
            <>
              <h4 className={styles.sectionTitle}>Gestión de usuarios temporales</h4>
              <form className={styles.passwordForm} onSubmit={handleCreateTemporaryUser}>
                <label className={styles.formGroup}><span className={styles.formLabel}>Nombre</span><input className={styles.input} value={tempName} onChange={(e) => setTempName(e.target.value)} required /></label>
                <label className={styles.formGroup}><span className={styles.formLabel}>Apellido</span><input className={styles.input} value={tempLastName} onChange={(e) => setTempLastName(e.target.value)} required /></label>
                <label className={styles.formGroup}><span className={styles.formLabel}>Correo</span><input className={styles.input} type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} required /></label>
                <label className={styles.formGroup}><span className={styles.formLabel}>Contraseña inicial</span><input className={styles.input} type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required /></label>
                <button className={styles.submitButton} type="submit">Crear usuario temporal</button>
              </form>
              <button className={styles.submitButton} type="button" onClick={handleLoadTemporaryUsers}>Listar usuarios temporales</button>
              {temporaryUsers.map((tempUser) => (
                <div key={tempUser.id || tempUser._id} className={styles.infoItem}>
                  <p className={styles.infoValue}>{tempUser.nombre || tempUser.email || tempUser.correo}</p>
                  <button className={styles.submitButton} type="button" onClick={() => handleUpdateTemporaryStatus(tempUser)}>Activar/Desactivar usuario temporal</button>
                </div>
              ))}
              <form className={styles.passwordForm} onSubmit={handleUpdateTemporaryPassword}>
                <label className={styles.formGroup}><span className={styles.formLabel}>ID usuario temporal</span><input className={styles.input} value={tempPasswordUserId} onChange={(e) => setTempPasswordUserId(e.target.value)} required /></label>
                <label className={styles.formGroup}><span className={styles.formLabel}>Nueva contraseña</span><input className={styles.input} type="password" value={tempNewPassword} onChange={(e) => setTempNewPassword(e.target.value)} required /></label>
                <button className={styles.submitButton} type="submit">Cambiar contraseña a usuario temporal</button>
              </form>
            </>
          )}
        </article>
      )}
    </section>
  );
};

export default Configuracion;
