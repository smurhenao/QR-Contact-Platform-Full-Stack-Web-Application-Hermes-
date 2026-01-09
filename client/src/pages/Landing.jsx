import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.landingContainer}>
      {/* Navbar Simple */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>Hermes 🕊️</div>
        <div className={styles.navButtons}>
          <button onClick={() => navigate('/login')} className={styles.btnSecondary}>Entrar</button>
          <button onClick={() => navigate('/register')} className={styles.btnPrimarySmall}>Registrarme</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.mainTitle}>
          Eleva tus enlaces con <span className={styles.gradientText}>QR Inteligentes</span>
        </h1>
        <p className={styles.subtitle}>
          Crea códigos personalizados con tu logo, rastrea cada escaneo en tiempo real y analiza el comportamiento de tus clientes.
        </p>
        <button onClick={() => navigate('/register')} className={styles.btnCTA}>
          Empieza ahora — Es gratis
        </button>
      </header>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <span>🎨</span>
          <h3>Branding Total</h3>
          <p>Personaliza colores y añade el logo de tu marca a cada código.</p>
        </div>
        <div className={styles.featureCard}>
          <span>📈</span>
          <h3>Analíticas Pro</h3>
          <p>Mira quién, cuándo y a qué hora escanean tus códigos.</p>
        </div>
        <div className={styles.featureCard}>
          <span>⚡</span>
          <h3>Links Dinámicos</h3>
          <p>Cambia el destino de tu QR en cualquier momento sin volver a imprimir.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;