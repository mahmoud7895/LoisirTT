import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ActivitesSportives.css';

const Evenements = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evenements, setEvenements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [beneficiaire, setBeneficiaire] = useState('Agent TT');
  const [age, setAge] = useState('');
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(3);
  const [formStep, setFormStep] = useState(1);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    comment: '',
  });

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('token');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    matricule: user?.matricule || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    residenceAdministrative: user?.residenceAdministrative || '',
    date_inscription: user?.date_inscription || '',
    password: '',
  });

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const isEventExpired = (eventDate) => {
    try {
      if (!eventDate) {
        console.debug('isEventExpired: eventDate is missing');
        return false;
      }
      const eventDateObj = new Date(eventDate);
      const currentDate = new Date();
      const isExpired = eventDateObj < currentDate;
      console.debug(`isEventExpired: eventDate=${eventDate}, currentDate=${currentDate.toISOString()}, isExpired=${isExpired}`);
      return isExpired;
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return false;
    }
  };

  const isEventFull = (ticketsAvailable) => {
    const isFull = ticketsAvailable <= 0;
    console.debug(`isEventFull: ticketsAvailable=${ticketsAvailable}, isFull=${isFull}`);
    return isFull;
  };

  const isEventNew = (id, allEvents) => {
    try {
      if (!allEvents || allEvents.length === 0) {
        console.debug('isEventNew: no events available');
        return false;
      }
      const ids = allEvents.map(event => event.id).sort((a, b) => b - a);
      const thresholdIndex = Math.ceil(ids.length * 0.1);
      const thresholdId = ids[thresholdIndex - 1] || ids[0];
      const isNew = id >= thresholdId;
      console.debug(`isEventNew: id=${id}, thresholdId=${thresholdId}, isNew=${isNew}`);
      return isNew;
    } catch (error) {
      console.error('Erreur lors de la vérification de la nouveauté:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchEvenements = async () => {
      if (!token) {
        toast.error('Vous devez être connecté pour accéder à cette page.');
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:3800/evenements', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(data)) {
          console.debug('Données brutes des événements:', JSON.stringify(data, null, 2));
          const sortedEvents = data.sort((a, b) => b.id - a.id);
          setEvenements(sortedEvents);
        } else {
          toast.error('Les données reçues ne sont pas valides.');
          console.error('Réponse API non valide:', data);
        }
      } catch (error) {
        let errorMessage = 'Erreur lors de la récupération des événements';
        if (error.response) {
          if (error.response.status === 401) {
            toast.error('Session invalide. Veuillez vous reconnecter.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          errorMessage = error.response.data.message || `Erreur serveur (${error.response.status})`;
        } else if (error.request) {
          errorMessage = 'Le serveur ne répond pas';
        } else {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        console.error('Erreur lors de la récupération des événements:', error);
      }
    };

    fetchEvenements();
  }, [token, navigate]);

  useEffect(() => {
    if (selectedEvent && numberOfTickets > 0) {
      setTotalAmount(numberOfTickets * selectedEvent.ticketPrice);
    } else {
      setTotalAmount(0);
    }
  }, [numberOfTickets, selectedEvent]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    if (!profileFormData[field]) {
      toast.error(`Le champ ${field} ne peut pas être vide.`);
      return;
    }

    try {
      if (!token) {
        toast.error('Session invalide. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:3800/users/${user.id}`,
        { [field]: profileFormData[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} mis à jour avec succès !`);

      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileFormData((prev) => ({
        ...prev,
        [field]: response.data[field] || prev[field],
      }));
      setEditingField(null);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du champ ${field}:`, error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || `Échec de la mise à jour du champ ${field}.`;
      if (error.response?.status === 401) {
        toast.error('Session invalide. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      toast.error(errorMessage);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setProfileFormData({
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

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = evenements
    .slice(indexOfFirstEvent, indexOfLastEvent)
    .sort((a, b) => {
      const isExpiredA = isEventExpired(a.eventDate);
      const isExpiredB = isEventExpired(b.eventDate);
      const isFullA = isEventFull(a.ticketsAvailable);
      const isFullB = isEventFull(b.ticketsAvailable);
      const isNewA = isEventNew(a.id, evenements);
      const isNewB = isEventNew(b.id, evenements);

      if (!isExpiredA && !isFullA && (isNewA || true)) return -1;
      if (!isExpiredB && !isFullB && (isNewB || true)) return 1;
      if (isFullA) return -1;
      if (isFullB) return 1;
      if (isExpiredA) return 1;
      if (isExpiredB) return -1;
      return 0;
    });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCardClick = async (evenement) => {
    if (isEventExpired(evenement.eventDate)) {
      // Contraintes : l'événement doit être terminé et l'utilisateur doit être inscrit0 inscrit
      try {
        if (!user?.id) {
          toast.error("Utilisateur non identifié. Veuillez vous reconnecter.");
          navigate('/login');
          return;
        }
        console.debug(`Vérification inscription: eventId=${evenement.id}, userId=${user.id}`);
        const response = await axios.get(`http://localhost:3800/inscription/check/${evenement.id}/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.debug('Réponse vérification inscription:', response.data);
        if (response.data.isInscribed) {
          setSelectedEvent(evenement);
          setReviewFormData({ rating: 0, comment: '' });
          setShowReviewModal(true);
        } else {
          toast.error("Seuls les inscrits peuvent donner leur avis sur cet événement.");
        }
      } catch (error) {
        let errorMessage = "Erreur lors de la vérification de l'inscription.";
        if (error.response) {
          errorMessage = error.response.data.message || `Erreur serveur (${error.response.status})`;
          if (error.response.status === 401) {
            toast.error("Session invalide. Veuillez vous reconnecter.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        } else if (error.request) {
          errorMessage = "Le serveur ne répond pas. Vérifiez qu'il est en marche.";
        } else {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        console.error('Erreur vérification inscription:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          request: error.request,
        });
      }
    } else if (evenement.ticketsAvailable <= 0) {
      toast.error(`L'événement ${evenement.eventName} est complet.`);
    } else {
      setSelectedEvent(evenement);
      setBeneficiaire('Agent TT');
      setAge('');
      setNumberOfTickets(1);
      setTotalAmount(evenement.ticketPrice);
      setFormStep(1);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setBeneficiaire('Agent TT');
    setAge('');
    setNumberOfTickets(1);
    setTotalAmount(0);
  
    setFormStep(1);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedEvent(null);
    setReviewFormData({ rating: 0, comment: '' });
  };

  const handleNextStep = () => {
    if (beneficiaire === 'enfant' && (!age || age < 3 || age > 17)) {
      toast.error("Veuillez entrer un âge valide pour l'enfant (entre 3 et 17 ans).");
      return;
    }
    setFormStep(2);
  };

  const handlePreviousStep = () => {
    setFormStep(1);
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('Vous devez être connecté pour soumettre un avis.');
      navigate('/login');
      return;
    }

    if (!selectedEvent) {
      toast.error('Aucun événement sélectionné.');
      return;
    }

    if (reviewFormData.rating < 1 || reviewFormData.rating > 5) {
      toast.error('Veuillez sélectionner une note entre 1 et 5.');
      return;
    }

    if (!reviewFormData.comment.trim()) {
      toast.error('Le commentaire ne peut pas être vide.');
      return;
    }

    if (user.matricule.length > 5) {
      toast.error('Le matricule doit contenir au maximum 5 caractères.');
      return;
    }

    try {
      const reviewData = {
        eventId: selectedEvent.id,
        userId: user.id,
        matricule: user.matricule,
        rating: Number(reviewFormData.rating),
        comment: reviewFormData.comment,
      };

      await axios.post('http://localhost:3800/reviews', reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Votre avis a été envoyé avec succès pour l'événement : ${selectedEvent.eventName}`);
      handleCloseReviewModal();
    } catch (error) {
      let errorMessage = "Erreur lors de la soumission de l'avis";
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session invalide. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        errorMessage = error.response.data.message || `Erreur serveur (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez qu\'il est en marche.';
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error('Erreur lors de la soumission de l\'avis:', error.response?.data || error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('Vous devez être connecté pour vous inscrire à un événement.');
      navigate('/login');
      return;
    }

    try {
      const payment = event.target.payment.value;

      if (numberOfTickets > selectedEvent.ticketsAvailable) {
        toast.error(`Il ne reste que ${selectedEvent.ticketsAvailable} tickets disponibles.`);
        return;
      }

      const inscriptionData = {
        matricule: user?.matricule,
        nom: user?.nom,
        prenom: user?.prenom,
        age: beneficiaire === 'enfant' ? Number(age) : null,
        beneficiaire: beneficiaire,
        payment: payment,
        eventname: selectedEvent.eventName,
        eventId: selectedEvent.id,
        userId: user.id,
        numberOfTickets: Number(numberOfTickets),
        totalAmount: totalAmount,
      };

      await axios.post('http://localhost:3800/inscription', inscriptionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Inscription réussie à l'événement : ${selectedEvent.eventName}`);
      handleCloseModal();

      const { data } = await axios.get('http://localhost:3800/evenements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.debug('Données des événements après inscription:', data);
      const sortedEvents = data.sort((a, b) => b.id - a.id);
      setEvenements(sortedEvents);
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription";
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session invalide. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          `Erreur serveur (${error.response.status})`;
        if (errorMessage.includes('complet')) {
          toast.error("Cet événement est complet. Vous ne pouvez plus vous inscrire.");
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez qu\'il est en marche.';
        toast.error(errorMessage);
      } else {
        errorMessage = error.message;
        toast.error(errorMessage);
      }
      console.error('Erreur détaillée:', error.response?.data || error);
    }
  };

  return (
    <div className="evenements">
      <header className="navbar">
        <div className="navbar-logo">
          <img src="/logo4.png" alt="Logo" />
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
            <button
              className={isActive('/personnel/clubs')}
              onClick={() => navigate('/personnel/clubs')}
            >
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
                  <div className="profile-field">
                    <strong>Nom :</strong>
                    {editingField === 'nom' ? (
                      <div className="edit-field">
                        <input
                          type="text"
                          name="nom"
                          value={profileFormData.nom}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez votre nom"
                        />
                        <button className="save-button" onClick={() => handleSave('nom')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.nom || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('nom')}
                          title="Modifier le nom"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Prénom :</strong>
                    {editingField === 'prenom' ? (
                      <div className="edit-field">
                        <input
                          type="text"
                          name="prenom"
                          value={profileFormData.prenom}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez votre prénom"
                        />
                        <button className="save-button" onClick={() => handleSave('prenom')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.prenom || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('prenom')}
                          title="Modifier le prénom"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Matricule :</strong>
                    {editingField === 'matricule' ? (
                      <div className="edit-field">
                        <input
                          type="text"
                          name="matricule"
                          value={profileFormData.matricule}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez votre matricule"
                        />
                        <button className="save-button" onClick={() => handleSave('matricule')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.matricule || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('matricule')}
                          title="Modifier le matricule"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Email :</strong>
                    {editingField === 'email' ? (
                      <div className="edit-field">
                        <input
                          type="email"
                          name="email"
                          value={profileFormData.email}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez votre email"
                        />
                        <button className="save-button" onClick={() => handleSave('email')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.email || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('email')}
                          title="Modifier l'email"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Téléphone :</strong>
                    {editingField === 'telephone' ? (
                      <div className="edit-field">
                        <input
                          type="tel"
                          name="telephone"
                          value={profileFormData.telephone}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez votre téléphone"
                        />
                        <button className="save-button" onClick={() => handleSave('telephone')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.telephone || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('telephone')}
                          title="Modifier le téléphone"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Résidence :</strong>
                    {editingField === 'residenceAdministrative' ? (
                      <div className="edit-field">
                        <select
                          name="residenceAdministrative"
                          value={profileFormData.residenceAdministrative}
                          onChange={handleProfileInputChange}
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="Espace TT Nabeul">Espace TT Nabeul</option>
                          <option value="ULS Nabeul Technique">ULS Nabeul Technique</option>
                          <option value="SAAF">SAAF</option>
                          <option value="SRH">SRH</option>
                          <option value="Direction">Direction</option>
                        </select>
                        <button
                          className="save-button"
                          onClick={() => handleSave('residenceAdministrative')}
                        >
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        {user?.residenceAdministrative || 'Non disponible'}
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('residenceAdministrative')}
                          title="Modifier la résidence"
                        ></i>
                      </>
                    )}
                  </div>
                  <div className="profile-field">
                    <strong>Inscription :</strong>
                    {formatDate(user?.date_inscription)}
                  </div>
                  <div className="profile-field">
                    <strong>Mot de passe :</strong>
                    {editingField === 'password' ? (
                      <div className="edit-field">
                        <input
                          type="password"
                          name="password"
                          value={profileFormData.password}
                          onChange={handleProfileInputChange}
                          placeholder="Entrez le nouveau mot de passe"
                        />
                        <button className="save-button" onClick={() => handleSave('password')}>
                          Enregistrer
                        </button>
                        <button className="cancel-button" onClick={cancelEditing}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        ********
                        <i
                          className="bi bi-pencil edit-icon"
                          onClick={() => startEditing('password')}
                          title="Changer le mot de passe"
                        ></i>
                      </>
                    )}
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

      <main className="evenements-content">
        <div className="container mt-5">
          <h2 className="mb-4">Événements disponibles</h2>
          <div className="row">
            {currentEvents.length > 0 ? (
              currentEvents.map((evenement) => {
                const imageUrl = evenement.eventImage
                  ? `http://localhost:3800${evenement.eventImage.startsWith('/') ? evenement.eventImage : '/' + evenement.eventImage}`
                  : 'https://via.placeholder.com/150';

                const isFull = isEventFull(evenement.ticketsAvailable);
                const isExpired = isEventExpired(evenement.eventDate);
                const isNew = isEventNew(evenement.id, evenements);

                console.debug(`Événement: ${evenement.eventName}, ticketsAvailable=${evenement.ticketsAvailable}, isFull=${isFull}, eventDate=${evenement.eventDate}, isExpired=${isExpired}, id=${evenement.id}, isNew=${isNew}`);

                let ribbonClass = 'badge flash-ribbon badge-new';
                let ribbonText = 'NEW';

                if (isExpired) {
                  ribbonClass = 'badge flash-ribbon badge-expired';
                  ribbonText = 'Finished';
                } else if (isFull) {
                  ribbonClass = 'badge flash-ribbon badge-full';
                  ribbonText = 'Sold Out';
                } else if (isNew) {
                  ribbonClass = 'badge flash-ribbon badge-new';
                  ribbonText = 'NEW';
                }

                console.debug(`Badge pour ${evenement.eventName}: ribbonClass=${ribbonClass}, ribbonText=${ribbonText}`);

                return (
                  <div
                    key={evenement.id}
                    className={`col-md-4 mb-4 ${isFull || isExpired ? 'event-full' : ''}`}
                    onClick={() => handleCardClick(evenement)}
                    style={{ cursor: isFull ? 'not-allowed' : 'pointer', position: 'relative' }}
                  >
                    {ribbonClass && (
                      <span className={ribbonClass} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}>
                        {ribbonText}
                      </span>
                    )}
                    <div className="card h-100">
                      <img
                        src={imageUrl}
                        alt={evenement.eventName}
                        className="card-img-top"
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{evenement.eventName}</h5>
                        <p className="card-text">
                          📅 {formatDate(evenement.eventDate)}
                          <br />
                          ⏰ {evenement.startTime || 'Non précisé'}
                          <br />
                          📍 {evenement.eventLocation || 'Non précisé'}
                          <br />
                          🎟️ {evenement.ticketsAvailable} tickets disponibles
                          <br />
                          💵 {evenement.ticketPrice} TND
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Aucun événement disponible.</p>
            )}
          </div>

          <div className="pagination d-flex justify-content-center align-items-center mt-4">
            <button
              className="btn btn-link"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left" style={{ color: '#00ffff', fontSize: '1.5rem' }} />
            </button>
            <span className="page-info mx-3">
              Page {currentPage} sur {Math.ceil(evenements.length / eventsPerPage)}
            </span>
            <button
              className="btn btn-link"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(evenements.length / eventsPerPage)}
            >
              <i className="bi bi-chevron-right" style={{ color: '#00ffff', fontSize: '1.5rem' }} />
            </button>
          </div>
        </div>
      </main>

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
                <button onClick={() => navigate('/personnel/evenements')}>
                  Événements
                </button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>À propos</h3>
            <p>
              Tunisie Telecom (TT) est votre partenaire pour des services de
              télécommunication et des activités socio-culturelles enrichissantes.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tunisie Telecom. Tous droits réservés.</p>
        </div>
      </footer>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Inscription à l'événement : {selectedEvent?.eventName}</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close" />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formStep === 1 && (
                  <>
                    <div className="form-group">
                      <label>Matricule</label>
                      <input type="text" className="form-control" value={user?.matricule || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" className="form-control" value={user?.nom || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Prénom</label>
                      <input type="text" className="form-control" value={user?.prenom || ''} readOnly />
                    </div>
                    <div className="form-group">
                      <label htmlFor="beneficiaire">Bénéficiaire</label>
                      <select
                        id="beneficiaire"
                        className="form-control"
                        value={beneficiaire}
                        onChange={(e) => setBeneficiaire(e.target.value)}
                        required
                      >
                        <option value="Agent TT">Agent TT</option>
                        <option value="enfant">Enfant</option>
                      </select>
                    </div>
                    {beneficiaire === 'enfant' && (
                      <div className="form-group">
                        <label htmlFor="age">Âge</label>
                        <input
                          type="number"
                          className="form-control"
                          id="age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          min="3"
                          max="17"
                          required
                          placeholder="Entrez l'âge"
                        />
                      </div>
                    )}
                  </>
                )}

                {formStep === 2 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="numberOfTickets">Nombre de tickets</label>
                      <input
                        type="number"
                        className="form-control"
                        id="numberOfTickets"
                        value={numberOfTickets}
                        onChange={(e) => setNumberOfTickets(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max={selectedEvent?.ticketsAvailable}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="totalAmount">Montant total (TND)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalAmount"
                        value={totalAmount}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="payment">Paiement par :</label>
                      <select className="form-control" id="payment" required>
                        <option value="creditCard">Carte de crédit</option>
                        <option value="paypal">PayPal</option>
                        <option value="cash">Espèces</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                {formStep === 1 && (
                  <>
                    <button type="button" className="btn btn-secondary close-btn" onClick={handleCloseModal}>
                      Fermer
                    </button>
                    <button type="button" className="btn btn-primary submit-btn" onClick={handleNextStep}>
                      Suivant
                    </button>
                  </>
                )}
                {formStep === 2 && (
                  <>
                    <button type="button" className="btn btn-secondary close-btn" onClick={handlePreviousStep}>
                      Précédent
                    </button>
                    <button type="submit" className="btn btn-primary submit-btn">
                      S'inscrire
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Donner votre avis sur : {selectedEvent?.eventName}</h5>
              <button type="button" className="btn-close" onClick={handleCloseReviewModal} aria-label="Close" />
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rating">Note (1 à 5)</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${reviewFormData.rating >= star ? 'filled' : ''}`}
                        onClick={() => setReviewFormData((prev) => ({ ...prev, rating: star }))}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="comment">Commentaire</label>
                  <textarea
                    id="comment"
                    name="comment"
                    className="form-control"
                    value={reviewFormData.comment}
                    onChange={handleReviewInputChange}
                    placeholder="Partagez votre expérience..."
                    required
                    rows="5"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary close-btn" onClick={handleCloseReviewModal}>
                  Fermer
                </button>
                <button type="submit" className="btn btn-primary submit-btn">
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Evenements;