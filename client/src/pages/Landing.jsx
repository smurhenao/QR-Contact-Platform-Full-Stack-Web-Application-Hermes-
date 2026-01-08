import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

const Landing = () => (
  <div className={styles.container} style={{ textAlign: 'center', paddingTop: '100px' }}>
    <h1 style={{ fontSize: '4rem', color: '#1e1b4b' }}>Hermes 🕊️</h1>
    <p style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '40px' }}>
      Lleva tus enlaces al mundo físico con QRs inteligentes y rastreables.
    </p>
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
      <Link to="/register" className={styles.btnGenerate} style={{ textDecoration: 'none' }}>Empezar Gratis</Link>
      <Link to="/login" className={styles.btnLogout} style={{ textDecoration: 'none' }}>Iniciar Sesión</Link>
    </div>
  </div>
);