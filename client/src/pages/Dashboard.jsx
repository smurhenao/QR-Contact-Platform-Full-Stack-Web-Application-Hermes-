import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import StatsChart from '../components/StatsChart.jsx';

const Dashboard = () => {
  const [qrs, setQrs] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    destinationUrl: '', 
    color: '#4f46e5' 
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchQrs = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/qr/user/${user.id}`, {
        headers: { 'x-auth-token': token }
      });
      setQrs(res.data);
    } catch (err) {
      console.error("Error cargando QRs:", err);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Usamos los nombres exactos que espera tu backend: name, destinationUrl, userId, color
      await axios.post('http://localhost:5000/api/qr/generate', 
        { 
          name: form.name, 
          destinationUrl: form.destinationUrl, 
          userId: user.id,
          color: form.color 
        },
        { headers: { 'x-auth-token': token } }
      );
      setForm({ name: '', destinationUrl: '', color: '#4f46e5' });
      fetchQrs();
    } catch (err) {
      console.error("Error al crear:", err.response?.data);
      alert("Error al crear el QR. Revisa la consola.");
    }
  };

  const handleOpenLink = (shortCode) => {
    window.open(`http://localhost:5000/api/qr/scan/${shortCode}`, '_blank');
    setTimeout(() => fetchQrs(), 1500);
  };

  const chartData = qrs.map(qr => ({
    name: qr.name,
    escaneos: qr.scanCount
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hermes 🕊️</h1>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className={styles.btnLogout}>
          Cerrar Sesión 🚪
        </button>
      </header>

      <div className={styles.welcomeBox}>
        <p>Bienvenido, <strong>{user?.name}</strong></p>
      </div>

      <form onSubmit={handleCreate} className={styles.formCard}>
        <input 
          className={styles.inputField} 
          type="text" 
          placeholder="Nombre del QR" 
          value={form.name} 
          onChange={(e) => setForm({...form, name: e.target.value})} 
          required 
        />
        <input 
          className={styles.inputField} 
          type="text" 
          placeholder="URL (https://...)" 
          value={form.destinationUrl} 
          onChange={(e) => setForm({...form, destinationUrl: e.target.value})} 
          required 
        />
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '10px', position: 'absolute', top: '-15px', right: '0', color: '#4f46e5', fontWeight: 'bold' }}>Color</label>
          <input 
            type="color" 
            value={form.color} 
            onChange={(e) => setForm({...form, color: e.target.value})}
            style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
          />
        </div>
        <button className={styles.btnGenerate}>Generar</button>
      </form>

      {qrs.length > 0 && <StatsChart data={chartData} />}

      <div className={styles.qrGrid}>
        {qrs.map((qr) => (
          <div key={qr._id} className={styles.card}>
            <h3 className={styles.qrName}>{qr.name}</h3>
            <img src={qr.qrImage} className={styles.qrImage} alt="QR" />
            <div className={styles.scanBox}>
              <span className={styles.scanCount}>{qr.scanCount}</span>
              <small className={styles.scanLabel}>ESCANEOS</small>
            </div>
            
            {/* TUS BOTONES ORIGINALES */}
            <button onClick={() => handleOpenLink(qr.shortCode)} className={styles.btnAction}>
              Abrir
            </button>
            
            <button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = qr.qrImage;
                a.download = `${qr.name}.png`;
                a.click();
              }} 
              className={styles.btnAction}
            >
              Descargar
            </button>
            
            <button 
              onClick={async () => {
                if(confirm("¿Eliminar?")) {
                  try {
                    await axios.delete(`http://localhost:5000/api/qr/${qr._id}`, {
                      headers: { 'x-auth-token': token }
                    });
                    fetchQrs();
                  } catch (e) { alert("Error al borrar"); }
                }
              }} 
              className={styles.btnDelete}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;