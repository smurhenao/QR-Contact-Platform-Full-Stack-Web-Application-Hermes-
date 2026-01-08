import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
      console.log("QRs cargados:", res.data);
    } catch (err) {
      console.error("Error cargando QRs:", err);
    }
  };

  const handleDownload = async (id, name) => {
  const element = document.getElementById(`qr-container-${id}`);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      useCORS: true, // Permite cargar logos desde URLs externas
      scale: 3,      // Aumenta la calidad de la descarga
      backgroundColor: "#ffffff" // Fondo blanco sólido
    });
    
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = `QR-${name}.png`;
    link.click();
  } catch (err) {
    console.error("Error al descargar:", err);
    alert("Error al procesar la imagen del QR.");
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
          color: form.color,
          logoUrl: form.logoUrl 
        },
        { headers: { 'x-auth-token': token } }
      );
      setForm({ name: '', destinationUrl: '', color: '#4f46e5', logoUrl: '' });
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

  const handleEdit = async (qr) => {
  const newUrl = prompt("Ingresa la nueva URL de destino:", qr.destinationUrl);
  const newName = prompt("Ingresa el nuevo nombre:", qr.name);

  if (newUrl && newName) {
    try {
      await axios.put(`http://localhost:5000/api/qr/${qr._id}`, 
        { name: newName, destinationUrl: newUrl },
        { headers: { 'x-auth-token': token } }
      );
      fetchQrs(); // Refrescamos la lista
    } catch (err) {
      alert("Error al actualizar");
    }
  }
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
        
        <input 
  className={styles.inputField} 
  type="text" 
  placeholder="URL del Logo (ej. icono de tu empresa,Google o Facebook)" 
  value={form.logoUrl} 
  onChange={(e) => setForm({...form, logoUrl: e.target.value})} 
/>

        <button className={styles.btnGenerate}>Generar</button>
      </form>

      {qrs.length > 0 && <StatsChart data={chartData} />}

      <div className={styles.qrGrid}>
        {qrs.map((qr) => (
          <div key={qr._id} className={styles.card}>
            <h3 className={styles.qrName}>{qr.name}</h3>

            {/* --- PASO 1: Agregamos el id al contenedor para html2canvas --- */}
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
                    borderRadius: '6px',
                    border: '1px solid #eee'
                  }} 
                />
              )}
            </div>

            {/* 2. CONTADOR DE ESCANEOS */}
            <div className={styles.scanBox}>
              <span className={styles.scanCount}>{qr.scanCount}</span>
              <small className={styles.scanLabel}>ESCANEOS</small>
            </div>
            
            {/* 3. BOTONES */}
            <button onClick={() => handleOpenLink(qr.shortCode)} className={styles.btnAction}>
              Abrir
            </button>
            
            {/* --- PASO 2: Botón de descarga actualizado con handleDownload --- */}
            <button 
              onClick={() => handleDownload(qr._id, qr.name)} 
              className={styles.btnAction}
            >
              Descargar
            </button>

      {/* El botón de editar lo ponemos aquí para que resalte */}
      <button 
        onClick={() => handleEdit(qr)} 
        className={styles.btnAction}
        style={{ backgroundColor: '#75cbe6ff', color: '#0e0601ff' }} 
      >
        Editar
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