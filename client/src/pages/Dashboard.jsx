import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [qrs, setQrs] = useState([]);
  const [form, setForm] = useState({ name: '', destinationUrl: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchQrs = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    try {
      // USAMOS LA URL COMPLETA AL PUERTO 5000
      const res = await axios.get(`http://localhost:5000/api/qr/user/${user.id}`, {
        headers: { 'x-auth-token': token }
      });
      setQrs(res.data);
    } catch (err) {
      console.error("Error cargando QRs:", err);
      if (err.response?.status === 401) navigate('/login');
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/qr/generate', 
        { ...form, userId: user.id },
        { headers: { 'x-auth-token': token } }
      );
      setForm({ name: '', destinationUrl: '' });
      fetchQrs();
    } catch (err) {
      alert("Error al crear el QR");
    }
  };

  const handleOpenLink = (shortCode) => {
    window.open(`http://localhost:5000/api/qr/scan/${shortCode}`, '_blank');
    setTimeout(() => fetchQrs(), 1500);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Borrar este mensajero?")) {
      try {
        await axios.delete(`http://localhost:5000/api/qr/${id}`, {
          headers: { 'x-auth-token': token }
        });
        fetchQrs();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hermes 🕊️</h1>
        <button onClick={handleLogout} className={styles.btnLogout}>
          Cerrar Sesión 🚪
        </button>
      </header>

      <div className={styles.welcomeBox}>
        <p>Bienvenido, <strong>{user?.name}</strong></p>
      </div>

      <form onSubmit={handleCreate} className={styles.formCard}>
        <input className={styles.inputField} type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        <input className={styles.inputField} type="text" placeholder="URL (https://...)" value={form.destinationUrl} onChange={(e) => setForm({...form, destinationUrl: e.target.value})} required />
        <button className={styles.btnGenerate}>Generar Ahora</button>
      </form>

      <div className={styles.qrGrid}>
        {qrs.map((qr) => (
          <div key={qr._id} className={styles.card}>
            <h3>{qr.name}</h3>
            {qr.qrImage ? (
              <img src={qr.qrImage} className={styles.qrImage} alt="QR" />
            ) : (
              <div className={styles.scanBox}>Generando...</div>
            )}
            <div className={styles.scanBox}>
              <span className={styles.scanCount}>{qr.scanCount}</span>
              <small>ESCANEOS</small>
            </div>
            <button onClick={() => handleOpenLink(qr.shortCode)} className={`${styles.btnAction} ${styles.btnOpen}`}>Abrir 🔗</button>
            <button onClick={() => {
              const a = document.createElement('a'); a.href = qr.qrImage; a.download = `QR-${qr.name}.png`; a.click();
            }} className={`${styles.btnAction} ${styles.btnDownload}`}>Descargar 📥</button>
            <button onClick={() => handleDelete(qr._id)} className={`${styles.btnAction} ${styles.btnDelete}`}>Eliminar 🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;