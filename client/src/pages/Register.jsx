import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Dashboard.module.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("🚀 ¡Cuenta creada! Ahora inicia sesión.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || "Error al registrarse");
    }
  };

  return (
    <div className={styles.container} style={{maxWidth: '400px', marginTop: '80px'}}>
      <h1 className={styles.title}>Crear Cuenta 🕊️</h1>
      <form onSubmit={handleSubmit} className={styles.card} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input 
          className={styles.inputField} 
          type="text" placeholder="Nombre completo" 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          className={styles.inputField} 
          type="email" placeholder="Correo electrónico" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          className={styles.inputField} 
          type="password" placeholder="Crea una contraseña" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button className={styles.btnGenerate} type="submit">Registrarme</button>
        <p style={{fontSize: '0.9rem'}}>
          ¿Ya tienes cuenta? <Link style={{color: '#4f46e5', fontWeight: 'bold'}} to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;