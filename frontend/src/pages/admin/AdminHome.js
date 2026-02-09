import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminHome.css';

const AdminHome = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('Accueil'); // État pour suivre le bouton actif

  // Récupérer les données de l'utilisateur depuis localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    const fullName = `${user?.nom ? user.nom : '[Nom non trouvé]'}`;

    toast.info(
      <div>
        <p>{fullName}, êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              toast.dismiss();
            }}
            style={{
              padding: '5px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Oui
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              padding: '5px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Non
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: 'top-center',
        style: { minWidth: '400px' },
      }
    );
  };

  // Fonction pour naviguer vers les pages admin
  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  return (
    <div className="admin-home">
      <ToastContainer />
      <header className="navbar">
        <div className="navbar-logo">
          <img src="../logo4.png" alt="Logo" />
        </div>
        <div className="navbar-links-container">
          <nav className="navbar-links">
            <button
              onClick={() => navigateTo('/admin', 'Accueil')}
              className={activeButton === 'Accueil' ? 'active' : ''}
            >
              Accueil
            </button>
            <button
              onClick={() => navigateTo('/admin/clubs', 'Clubs')}
              className={activeButton === 'Clubs' ? 'active' : ''}
            >
              Clubs
            </button>
            <button
              onClick={() => navigateTo('/admin/activites-sportives', 'Activités sportives')}
              className={activeButton === 'Activités sportives' ? 'active' : ''}
            >
              Activités sportives
            </button>
            <button
              onClick={() => navigateTo('/admin/evenements', 'Événements')}
              className={activeButton === 'Événements' ? 'active' : ''}
            >
              Événements
            </button>
            <button
              onClick={() => navigateTo('/admin/inscription_evenement', 'Participants aux Événements')}
              className={activeButton === 'Participants aux Événements' ? 'active' : ''}
            >
              Participants aux Événements
            </button>
                        <button
              onClick={() => navigateTo('/admin/reviews', 'Avis')}
              className={activeButton === 'Avis' ? 'active' : ''}
            >
              Avis
            </button>
            <button
              onClick={() => navigateTo('/admin/compte', 'Compte')}
              className={activeButton === 'Compte' ? 'active' : ''}
            >
              Compte
            </button>
            <button
        onClick={() => navigateTo('/admin/dashboard', 'Dashboard')}
        className={activeButton === 'Dashboard' ? 'active' : ''}
      >
        Dashboard
      </button>
          </nav>
        </div>
        <div className="logout-section">
          <button
            className="logout-button btn btn-link"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      <main className="admin-content">
        <h1>Bienvenue sur l'interface Admin</h1>
      </main>
    </div>
  );
};

export default AdminHome;