import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import styles from './Dashboard.module.css'; // Reutilizamos tus estilos base

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      // Guardamos Token e Info del usuario
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate('/dashboard'); // Saltamos al dashboard
    } catch (err) {
      alert(err.response?.data?.msg || "Error al iniciar sesión");
    }
  };

  return (
    <div className={styles.container} style={{maxWidth: '400px', marginTop: '100px'}}>
      <h1 className={styles.title}>Entrar a Hermes 🕊️</h1>
      <form onSubmit={handleSubmit} className={styles.card} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input 
          className={styles.inputField} 
          type="email" placeholder="Correo electrónico" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          className={styles.inputField} 
          type="password" placeholder="Contraseña" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button className={styles.btnGenerate} type="submit">Iniciar Sesión</button>
        <p>¿No tienes cuenta? <Link style={{color: '#4f46e5'}} to="/register">Regístrate aquí</Link></p>
      </form>
    </div>
  );
};

export default Login;