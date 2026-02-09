import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ActivitesSportives.css';
import './PersonnelHome.css';

const PersonnelHome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userData = localStorage.getItem('user');
  const [user, setUser] = useState(userData ? JSON.parse(userData) : null);

  // État pour le menu déroulant du profil
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // État pour le champ en cours d'édition
  const [editingField, setEditingField] = useState(null);
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    matricule: user?.matricule || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    residenceAdministrative: user?.residenceAdministrative || '',
    date_inscription: user?.date_inscription || '',
    password: '',
  });
  // État pour gérer l'ouverture du modal d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Synchroniser formData avec user lorsque user change
  useEffect(() => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      matricule: user?.matricule || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      residenceAdministrative: user?.residenceAdministrative || '',
      date_inscription: user?.date_inscription || '',
      password: '',
    });
  }, [user]);

  // Liste des images principales
  const images = [
    "/images/image 1.jpg",
    "/images/image 3.jpg",
    "/images/telecome2.png",
    "/images/image 2.jpeg",
  ];

  // Données des cartes
  const clubs = [
    { img: "/images/chant.jpeg", title: "Club de chant", path: "/personnel/clubs" },
    { img: "/images/dance.jpeg", title: "Club de danse", path: "/personnel/clubs" },
    { img: "/images/theatre1.jpeg", title: "Club de théâtre", path: "/personnel/clubs" },
  ];

  const sports = [
    { img: "/images/tennis1.jpeg", title: "Tennis", path: "/personnel/activites-sportives" },
    { img: "/images/football1.jpeg", title: "Football", path: "/personnel/activites-sportives" },
    { img: "/images/basketball1.jpeg", title: "Basketball", path: "/personnel/activites-sportives" },
  ];

  const events = [
    { img: "/images/soire.jpeg", title: "Soirée ramadanesque", path: "/personnel/evenements" },
    { img: "/images/seminaire.jpeg", title: "Séminaire", path: "/personnel/evenements" },
    { img: "/images/hotel.jpeg", title: "Hôtel", path: "/personnel/evenements" },
  ];

  // États pour les carrousels
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Débogage des données utilisateur
  useEffect(() => {
    console.log('Données utilisateur chargées depuis localStorage:', JSON.stringify(user, null, 2));
    if (!user) {
      console.warn('Aucun utilisateur trouvé dans localStorage');
      navigate('/login');
    } else if (!user.email || !user.telephone || !user.residenceAdministrative || !user.date_inscription) {
      console.warn('Données utilisateur incomplètes:', JSON.stringify(user, null, 2));
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
      toast.error('Session invalide, veuillez vous reconnecter.');
    }
  }, [user, navigate]);

  // Pagination automatique des images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [images.length]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    const fullName = `${user?.nom || '[Nom non trouvé]'} ${user?.prenom || '[Prénom non trouvé]'}`;
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

  const scrollToSocioCulturalActivities = () => {
    const section = document.getElementById('clubs-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Formatage de la date
  const formatDate = (date) => {
    if (!date) return 'Non disponible';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Non disponible';
    }
  };

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ouvrir le modal d'édition
  const openEditModal = (field) => {
    setEditingField(field);
    setIsEditModalOpen(true);
  };

  // Sauvegarder les modifications
  const handleSave = async (field) => {
    if (!formData[field]) {
      toast.error(`Le champ ${field} ne peut pas être vide.`);
      return;
    }

    console.log(`Tentative de sauvegarde du champ ${field}:`, formData[field]);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session invalide. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:3800/users/${user.id}`,
        { [field]: formData[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} mis à jour avec succès !`);

      // Créer une nouvelle référence d'objet pour forcer le re-rendu
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser); // Mettre à jour l'état user
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Mettre à jour localStorage
      setIsEditModalOpen(false);
      setEditingField(null);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du champ ${field}:`, error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || `Échec de la mise à jour du champ ${field}.`;
      toast.error(errorMessage);
    }
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setIsEditModalOpen(false);
    setEditingField(null);
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      matricule: user?.matricule || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      residenceAdministrative: user?.residenceAdministrative || '',
      date_inscription: user?.date_inscription || '',
      password: '',
    });
  };

  return (
    <div className="admin-home">
      {/* En-tête */}
      <header className="navbar">
        <div className="navbar-logo">
          <img src="../logo4.png" alt="Logo" />
        </div>
        <div className="navbar-links-container">
          <nav className="navbar-links">
            <button className={isActive('/personnel')} onClick={() => navigate('/personnel')}>
              Accueil
            </button>
            <button
              className={isActive('/personnel/activites-sportives')}
              onClick={() => navigate('/personnel/activites-sportives')}
            >
              Activités sportives
            </button>
            <button className={isActive('/personnel/clubs')} onClick={() => navigate('/personnel/clubs')}>
              Clubs
            </button>
            <button
              className={isActive('/personnel/evenements')}
              onClick={() => navigate('/personnel/evenements')}
            >
              Événements
            </button>
          </nav>
        </div>
        <div className="logout-section">
          <div className="profile-selector">
            <div className="profile-label">
              <i className="bi bi-person me-2"></i>
              <span>Profil</span>
            </div>
            <div
              className="profile-circle"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Profil utilisateur"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profil" className="profile-image" />
              ) : (
                <span className="profile-initials">
                  {user?.nom?.charAt(0) || '?'}
                  {user?.prenom?.charAt(0) || '?'}
                </span>
              )}
            </div>
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <h3>Profil utilisateur</h3>
                </div>
                <div className="profile-details">
                  {/* Nom */}
                  <div className="profile-field">
                    <strong>Nom :</strong>
                    {user?.nom || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('nom')}
                      title="Modifier le nom"
                    ></i>
                  </div>
                  {/* Prénom */}
                  <div className="profile-field">
                    <strong>Prénom :</strong>
                    {user?.prenom || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('prenom')}
                      title="Modifier le prénom"
                    ></i>
                  </div>
                  {/* Matricule */}
                  <div className="profile-field">
                    <strong>Matricule :</strong>
                    {user?.matricule || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('matricule')}
                      title="Modifier le matricule"
                    ></i>
                  </div>
                  {/* Email */}
                  <div className="profile-field">
                    <strong>Email :</strong>
                    {user?.email || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('email')}
                      title="Modifier l'email"
                    ></i>
                  </div>
                  {/* Téléphone */}
                  <div className="profile-field">
                    <strong>Téléphone :</strong>
                    {user?.telephone || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('telephone')}
                      title="Modifier le téléphone"
                    ></i>
                  </div>
                  {/* Résidence Administrative */}
                  <div className="profile-field">
                    <strong>Résidence :</strong>
                    {user?.residenceAdministrative || 'Non disponible'}
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('residenceAdministrative')}
                      title="Modifier la résidence"
                    ></i>
                  </div>
                  {/* Date d'inscription (non modifiable) */}
                  <div className="profile-field">
                    <strong>Inscription :</strong>
                    {formatDate(user?.date_inscription)}
                  </div>
                  {/* Mot de passe */}
                  <div className="profile-field">
                    <strong>Mot de passe :</strong>
                    ********
                    <i
                      className="bi bi-pencil edit-icon"
                      onClick={() => openEditModal('motDePasse')}
                      title="Changer le mot de passe"
                    ></i>
                  </div>
                </div>
                <button className="profile-logout-button" onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Modifier {editingField === 'motDePasse' ? 'le mot de passe' : editingField}
              </h3>
              <span className="close-btn" onClick={cancelEditing}>
                ×
              </span>
            </div>
            <div className="modal-body">
              {editingField === 'residenceAdministrative' ? (
                <select
                  name={editingField}
                  value={formData[editingField]}
                  onChange={handleInputChange}
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Espace TT Nabeul">Espace TT Nabeul</option>
                  <option value="ULS Nabeul Technique">ULS Nabeul Technique</option>
                  <option value="SAAF">SAAF</option>
                  <option value="SRH">SRH</option>
                  <option value="Direction">Direction</option>
                </select>
              ) : (
                <input
                  type={editingField === 'motDePasse' ? 'password' : 'text'}
                  name={editingField}
                  value={formData[editingField]}
                  onChange={handleInputChange}
                  placeholder={`Entrez ${editingField === 'motDePasse' ? 'le nouveau mot de passe' : 'la nouvelle valeur'}`}
                />
              )}
            </div>
            <div className="modal-footer">
              <button className="submit-btn" onClick={() => handleSave(editingField)}>
                Enregistrer
              </button>
              <button className="close-btn" onClick={cancelEditing}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="personnel-home-content">
        <div className="personnel-home-image-section">
          <div className="personnel-home-text-container">
            <h1 className="personnel-home-overlay-text">
              Bienvenue {user?.nom || '[Nom non trouvé]'} {user?.prenom || '[Prénom non trouvé]'}
            </h1>
            <p className="personnel-home-description">
              Découvrez notre application dédiée aux agents de Tunisie Telecom pour enrichir votre quotidien grâce à nos activités
              socio-culturelles, incluant nos différents clubs, activités sportives et événements.
            </p>
            <button
              className="personnel-home-discover-button"
              onClick={scrollToSocioCulturalActivities}
            >
              Découvrir nos activités socio-culturelles
            </button>
          </div>
          <div className="personnel-home-image-container">
            <img
              src={images[currentImageIndex]}
              alt="Bannière d'accueil"
              className="personnel-home-image"
            />
          </div>
        </div>

        {/* Section Clubs */}
        <h2 className="personnel-home-section-title" id="clubs-section">
          Nos Clubs fournis par notre entreprise TT
        </h2>
        <section className="personnel-home-activities-section">
          <div className="carousel-container">
            {clubs.map((club, index) => (
              <div key={index} className="personnel-home-activity-card">
                <img src={club.img} alt={club.title} />
                <h3>{club.title}</h3>
                <button
                  className="personnel-home-subscribe-button"
                  onClick={() => navigate(club.path)}
                >
                  Inscrivez-vous
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section Activités Sportives */}
        <h2 className="personnel-home-section-title" id="sports-section">
          Nos Activités sportives fournies par notre entreprise TT
        </h2>
        <section className="personnel-home-activities-section">
          <div className="carousel-container">
            {sports.map((sport, index) => (
              <div key={index} className="personnel-home-activity-card">
                <img src={sport.img} alt={sport.title} />
                <h3>{sport.title}</h3>
                <button
                  className="personnel-home-subscribe-button"
                  onClick={() => navigate(sport.path)}
                >
                  Inscrivez-vous
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section Événements */}
        <h2 className="personnel-home-section-title" id="events-section">
          Nos Événements fournis par notre entreprise TT
        </h2>
        <section className="personnel-home-activities-section">
          <div className="carousel-container">
            {events.map((event, index) => (
              <div key={index} className="personnel-home-activity-card">
                <img src={event.img} alt={event.title} />
                <h3>{event.title}</h3>
                <button
                  className="personnel-home-subscribe-button"
                  onClick={() => navigate(event.path)}
                >
                  Inscrivez-vous
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="personnel-home-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Tunisie Telecom</h3>
            <p>Adresse : Avenue de la République, 1001 Tunis, Tunisie</p>
            <p>Téléphone : +216 71 123 456</p>
            <p>Email : contact@tunisietelecom.tn</p>
          </div>
          <div className="footer-section">
            <h3>Liens rapides</h3>
            <ul>
              <li>
                <button onClick={() => navigate('/personnel')}>Accueil</button>
              </li>
              <li>
                <button onClick={() => navigate('/personnel/activites-sportives')}>
                  Activités sportives
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/personnel/clubs')}>Clubs</button>
              </li>
              <li>
                <button onClick={() => navigate('/personnel/evenements')}>Événements</button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>À propos</h3>
            <p>
              Tunisie Telecom (TT) est votre partenaire pour des services de télécommunication et
              des activités socio-culturelles enrichissantes.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tunisie Telecom. Tous droits réservés.</p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default PersonnelHome;