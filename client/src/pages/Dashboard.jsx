import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import StatsChart from '../components/StatsChart.jsx';
import html2canvas from 'html2canvas';

const Dashboard = () => {
  const [qrs, setQrs] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    destinationUrl: '', 
    color: '#4f46e5',
    logoUrl: ''
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
      await axios.post('http://localhost:5000/api/qr/generate', 
        { 
          name: form.name, 
          destinationUrl: form.destinationUrl, 
          userId: user.id,
          color: form.color,
          logoUrl: form.logoUrl 
        },
        { headers: { 'x-auth-token': token } }
      );
      setForm({ name: '', destinationUrl: '', color: '#4f46e5', logoUrl: '' });
      fetchQrs();
    } catch (err) {
      alert("Error al crear el QR.");
    }
  };

  const handleDownload = async (id, name) => {
    const element = document.getElementById(`qr-container-${id}`);
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 3,
        backgroundColor: "#ffffff"
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `QR-${name}.png`;
      link.click();
    } catch (err) {
      console.error("Error al descargar:", err);
    }
  };

  const handleOpenLink = (shortCode) => {
    window.open(`http://localhost:5000/api/qr/scan/${shortCode}`, '_blank');
    setTimeout(() => fetchQrs(), 1500);
  };

  const handleEdit = async (qr) => {
    const newUrl = prompt("Ingresa la nueva URL de destino:", qr.destinationUrl);
    const newName = prompt("Ingresa el nuevo nombre:", qr.name);
    if (newUrl && newName) {
      try {
        await axios.put(`http://localhost:5000/api/qr/${qr._id}`, 
          { name: newName, destinationUrl: newUrl },
          { headers: { 'x-auth-token': token } }
        );
        fetchQrs();
      } catch (err) {
        alert("Error al actualizar");
      }
    }
  };

  // --- PROCESAMIENTO DE DATOS ---
  const chartData = qrs.map(qr => ({
    name: qr.name,
    escaneos: qr.scanCount
  }));

  const getHourlyStats = () => {
    const hoursArray = Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      visitas: 0
    }));

    qrs.forEach(qr => {
      if (qr.scans) {
        qr.scans.forEach(scan => {
          const hour = new Date(scan.timestamp).getHours();
          hoursArray[hour].visitas++;
        });
      }
    });
    return hoursArray;
  };

  const hourlyData = getHourlyStats();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/" style={{ textDecoration: 'none' }}>
    <h1 className={styles.title}>inicio 🕊️</h1>
  </Link>
        <h1 className={styles.title}>Dashboard: </h1>
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
        <input 
          type="color" 
          value={form.color} 
          onChange={(e) => setForm({...form, color: e.target.value})}
        />
        <input 
          className={styles.inputField} 
          type="text" 
          placeholder="URL del Logo" 
          value={form.logoUrl} 
          onChange={(e) => setForm({...form, logoUrl: e.target.value})} 
        />
        <button className={styles.btnGenerate}>Generar</button>
      </form>

      {/* ESTADÍSTICAS */}
      {qrs.length > 0 && (
        <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
          <h2 style={{ color: '#4f46e5' }}>Rendimiento de Escaneos 📈</h2>
          <StatsChart data={chartData} dataKey="escaneos"/>
          
        
        </div>
      )}

      {/* GRILLA DE QRS */}
      <div className={styles.qrGrid}>
        {qrs.map((qr) => (
          <div key={qr._id} className={styles.card}>
            <h3 className={styles.qrName}>{qr.name}</h3>

            <div 
              id={`qr-container-${qr._id}`} 
              style={{ position: 'relative', display: 'inline-block', marginBottom: '15px', padding: '10px', backgroundColor: 'white' }}
            >
              <img src={qr.qrImage} className={styles.qrImage} alt="QR" />
              {qr.logoUrl && (
                <img 
                  src={qr.logoUrl} 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '35px',
                    height: '35px',
                    backgroundColor: 'white',
                    padding: '3px',
                    borderRadius: '6px'
                  }} 
                />
              )}
            </div>

            <div className={styles.scanBox}>
              <span className={styles.scanCount}>{qr.scanCount}</span>
              <small className={styles.scanLabel}>ESCANEOS</small>
            </div>
            
            <button onClick={() => handleOpenLink(qr.shortCode)} className={styles.btnAction}>Abrir</button>
            <button onClick={() => handleDownload(qr._id, qr.name)} className={styles.btnAction}>Descargar</button>
            <button onClick={() => handleEdit(qr)} className={styles.btnAction} style={{ backgroundColor: '#75cbe6' }}>Editar</button>
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
      <div style={{ marginTop: '50px', backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
  <h2 style={{ color: '#1e1b4b', marginBottom: '15px' }}>Historial Reciente 🕒</h2>
  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
          <th style={{ padding: '10px' }}>Código</th>
          <th style={{ padding: '10px' }}>Fecha</th>
          <th style={{ padding: '10px' }}>Hora</th>
        </tr>
      </thead>
      <tbody>
        {qrs.flatMap(qr => 
          (qr.scans || []).map(scan => ({
            name: qr.name,
            date: new Date(scan.timestamp).toLocaleDateString(),
            time: new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawDate: new Date(scan.timestamp)
          }))
        )
        .sort((a, b) => b.rawDate - a.rawDate) // Ordenar por los más recientes
        .slice(0, 100) // Mostrar solo los últimos 10
        .map((scan, index) => (
          <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>{scan.name}</td>
            <td style={{ padding: '10px' }}>{scan.date}</td>
            <td style={{ padding: '10px' }}>{scan.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {qrs.every(qr => !qr.scans?.length) && (
      <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '10px' }}>Aún no hay escaneos registrados.</p>
    )}
  </div>
</div>
    </div>
  );
};

export default Dashboard;