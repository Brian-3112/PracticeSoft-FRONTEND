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
const capitalizeWords = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const Configuracion = () => {
  const { auth, config } = useAuth();
  const user = getUserFromAuth(auth);
  const isAdmin = (user?.role ?? auth?.role) === 'admin';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryUsers, setTemporaryUsers] = useState([]);
  const [tempName, setTempName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempAllowedModules, setTempAllowedModules] = useState(['disponibilidad', 'clientes', 'vehiculos', 'rentas']);
  const [tempPasswordUserId, setTempPasswordUserId] = useState('');
  const [tempNewPassword, setTempNewPassword] = useState('');
  const [showUsersList, setShowUsersList] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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
        nombre: capitalizeWords(tempName),
        apellido: capitalizeWords(tempLastName),
        correo: tempEmail,
        password: tempPassword,
        role: 'empleado',
        allowedModules: tempAllowedModules,
      }, config);
      setTempName(''); setTempLastName(''); setTempEmail(''); setTempPassword('');
      setTempAllowedModules(['disponibilidad', 'clientes', 'vehiculos', 'rentas']);
      Swal.fire({ title: 'Usuario temporal creado', icon: 'success' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudo crear el usuario temporal.', icon: 'error' });
    }
  };
  const handleToggleTempModule = (moduleKey) => {
    setTempAllowedModules((prev) => (
      prev.includes(moduleKey) ? prev.filter((module) => module !== moduleKey) : [...prev, moduleKey]
    ));
  };

  const handleLoadTemporaryUsers = async () => {
    if (showUsersList) {
      setShowUsersList(false);
      setShowPasswordForm(false);
      return;
    }
    try {
      const data = await getTemporaryUsers(config);
      setTemporaryUsers(Array.isArray(data) ? data : (data?.usuarios || data?.data || []));
      setShowUsersList(true);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error?.response?.data?.message || 'No se pudieron consultar usuarios temporales.', icon: 'error' });
    }
  };
  const handleUpdateTemporaryStatus = async (tempUser) => {
    try {
      await updateTemporaryUserStatus(tempUser.id || tempUser._id, { isActive: !(tempUser.isActive ?? tempUser.activo) }, config);
      Swal.fire({ title: 'Estado actualizado', icon: 'success' });
      const data = await getTemporaryUsers(config);
      setTemporaryUsers(Array.isArray(data) ? data : (data?.usuarios || data?.data || []));
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
        <div className={styles.temporarySection}>
          <article className={`${styles.passwordCard} ${styles.temporaryManagerCard}`}>
              <div className={styles.temporaryManagerContent}>
                <div className={styles.managerPanel}>
                  <h4 className={styles.sectionTitle}>Gestión de usuarios temporales</h4>
                  <form className={styles.passwordForm} onSubmit={handleCreateTemporaryUser}>
                    <p className={styles.sectionText}>Crear usuario temporal</p>
                    <div className={styles.inlineFields}>
                      <label className={styles.formGroup}><span className={styles.formLabel}>Nombre</span><input className={styles.input} value={tempName} onChange={(e) => setTempName(e.target.value)} required /></label>
                      <label className={styles.formGroup}><span className={styles.formLabel}>Apellido</span><input className={styles.input} value={tempLastName} onChange={(e) => setTempLastName(e.target.value)} required /></label>
                    </div>
                    <div className={styles.inlineFields}>
                      <label className={styles.formGroup}><span className={styles.formLabel}>Correo</span><input className={styles.input} type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} required /></label>
                      <label className={styles.formGroup}><span className={styles.formLabel}>Contraseña inicial</span><input className={styles.input} type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required /></label>
                    </div>
                    <div className={styles.modulesBox}>
                      <p className={styles.modulesTitle}>Módulos permitidos</p>
                      <div className={styles.modulesGrid}>
                        {[
                          { key: 'disponibilidad', label: 'Disponibilidad' },
                          { key: 'dashboard', label: 'Dashboard' },
                          { key: 'clientes', label: 'Clientes' },
                          { key: 'vehiculos', label: 'Vehículos' },
                          { key: 'rentas', label: 'Rentas' },
                          { key: 'documentacion', label: 'Documentación' },
                          { key: 'configuracion', label: 'Configuración' },
                        ].map((module) => (
                          <label key={module.key} className={styles.moduleOption}>
                            <input
                              type="checkbox"
                              checked={tempAllowedModules.includes(module.key)}
                              onChange={() => handleToggleTempModule(module.key)}
                            />
                            <span>{module.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button className={`${styles.submitButton} ${styles.primaryButton}`} type="submit">Crear usuario temporal</button>
                  </form>
                </div>
              </div>
          </article>

          <aside className={styles.listPanel}>
            <h4 className={styles.sectionTitle}>Usuarios temporales</h4>
            <p className={styles.sectionText}>Consulta y administra el estado de los usuarios temporales.</p>
            <button className={`${styles.submitButton} ${styles.secondaryAction} ${styles.outlineButton}`} type="button" onClick={handleLoadTemporaryUsers}>
              {showUsersList ? 'Ocultar usuarios temporales' : 'Listar usuarios temporales'}
            </button>
            {showUsersList && (
              <>
                <div className={styles.temporaryUsersList}>
                  {temporaryUsers.map((tempUser) => (
                    <div key={tempUser.id || tempUser._id} className={styles.temporaryUserRow}>
                      <p className={`${styles.infoValue} ${styles.temporaryUserName}`}>
                        {`${tempUser.nombre ?? ''} ${tempUser.apellido ?? ''}`.trim() || tempUser.email || tempUser.correo}
                      </p>
                      <button className={styles.statusIconButton} type="button" onClick={() => handleUpdateTemporaryStatus(tempUser)} title="Activar/Desactivar usuario temporal" aria-label="Activar o desactivar usuario temporal">
                        {(tempUser.isActive ?? tempUser.activo) ? <span aria-hidden="true">✅</span> : <span aria-hidden="true">⛔</span>}
                      </button>
                    </div>
                  ))}
                </div>
                <button className={`${styles.submitButton} ${styles.darkButton}`} type="button" onClick={() => setShowPasswordForm((prev) => !prev)}>
                  {showPasswordForm ? 'Ocultar formulario de contraseña' : 'Abrir formulario de cambiar contraseña'}
                </button>
              </>
            )}
            {showPasswordForm && (
              <form className={`${styles.passwordForm} ${styles.temporaryPasswordForm} ${styles.managerPanel}`} onSubmit={handleUpdateTemporaryPassword}>
                <p className={styles.managerPanelTitle}>Actualizar contraseña temporal</p>
                <label className={styles.formGroup}><span className={styles.formLabel}>ID usuario temporal</span><input className={styles.input} value={tempPasswordUserId} onChange={(e) => setTempPasswordUserId(e.target.value)} required /></label>
                <label className={styles.formGroup}><span className={styles.formLabel}>Nueva contraseña</span><input className={styles.input} type="password" value={tempNewPassword} onChange={(e) => setTempNewPassword(e.target.value)} required /></label>
                <button className={`${styles.submitButton} ${styles.darkButton}`} type="submit">Cambiar contraseña a usuario temporal</button>
              </form>
            )}
          </aside>
        </div>
      )}
    </section>
  );
};

export default Configuracion;
