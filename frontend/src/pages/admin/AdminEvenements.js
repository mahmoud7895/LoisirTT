import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './AdminEvenements.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [eventLocation, setEventLocation] = useState({ lat: 36.8065, lng: 10.1815 });
  const [eventLocationAddress, setEventLocationAddress] = useState('');
  const [ticketNumber, setTicketNumber] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [eventImage, setEventImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeButton, setActiveButton] = useState('Événements');

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(2);

  // Récupérer les données de l'utilisateur et le token depuis localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('token');

  // Fonction pour naviguer et mettre à jour le bouton actif
  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  // Récupérer les événements depuis l'API avec authentification
  const fetchEvents = useCallback(async () => {
    // Vérifier si le token existe
    if (!token) {
      toast.error('Vous devez être connecté pour accéder à cette page.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3800/evenements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedEvents = response.data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id;
      });
      setEvents(sortedEvents);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expirée ou non autorisée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
        toast.error(`Erreur lors de la récupération des événements : ${errorMsg} (Statut: ${error.response?.status})`);
        console.error('Détails de l\'erreur:', error);
      }
    }
  }, [token, navigate]);

  // Charger les événements au montage du composant
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Pagination : Calculer les événements à afficher
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour envoyer un e-mail de notification
  const sendEmailNotification = async (eventId) => {
    try {
      const response = await axios.post('http://localhost:3800/mailer/send-event-notification', {
        eventId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.success === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de notification :', error.response?.data || error.message);
      return false;
    }
  };

  // Fonction générique pour afficher les toasts de confirmation
  const showConfirmationToast = (message, onConfirm) => {
    toast.info(
      <div>
        <p>{message}</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss();
            }}
            style={{
              padding: '5px 15px',
              backgroundColor: '#28a745',
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

  // Gérer la soumission du formulaire (création ou édition)
  const handleSubmit = async () => {
    const fullName = `${user?.nom || '[Nom non trouvé]'} ${user?.prenom || '[Prénom non trouvé]'}`;
    const actionType = selectedEvent ? 'mettre à jour' : 'publier';

    showConfirmationToast(
      `${fullName}, êtes-vous sûr de vouloir ${actionType} cet événement ?`,
      async () => {
        const formData = new FormData();
        formData.append('eventName', eventName);
        formData.append('eventDate', eventDate);
        formData.append('startTime', startTime);
        formData.append('eventLocation', eventLocationAddress);
        formData.append('ticketNumber', ticketNumber);
        formData.append('ticketPrice', ticketPrice);
        if (eventImage) {
          formData.append('eventImage', eventImage);
        }

        try {
          const url = selectedEvent
            ? `http://localhost:3800/evenements/${selectedEvent.id}`
            : 'http://localhost:3800/evenements';
          const method = selectedEvent ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method,
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Erreur lors de la soumission du formulaire");

          const eventData = await response.json();
          toast.success(selectedEvent ? 'Événement mis à jour avec succès' : 'Événement publié avec succès');

          const emailSent = await sendEmailNotification(eventData.id);
          if (emailSent) {
            toast.success('E-mails de notification envoyés avec succès');
          } else {
            console.warn('Erreur lors de l\'envoi de l\'e-mail de notification');
          }

          // Réinitialiser le formulaire
          setEventName('');
          setEventDate('');
          setStartTime('');
          setEventLocation({ lat: 36.8065, lng: 10.1815 });
          setEventLocationAddress('');
          setTicketNumber(0);
          setTicketPrice(0);
          setEventImage(null);
          setStep(1);
          setSelectedEvent(null);

          fetchEvents();
        } catch (error) {
          toast.error(selectedEvent ? "Erreur lors de la mise à jour de l'événement" : "Erreur lors de la publication de l'événement");
        }
      }
    );
  };

  // Gérer les étapes du formulaire
  const handleNext = () => {
    if (step === 1) {
      if (eventName && eventDate && startTime) {
        // Vérifier si la date de l'événement est supérieure ou égale à la date actuelle
        const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        if (eventDate < currentDate) {
          toast.error('La date de l\'événement doit être supérieur ou égale à la date actuelle. Veuillez modifier la date.');
          return;
        }
        setStep(step + 1);
      } else {
        toast.error("Veuillez remplir tous les champs de l'étape 1.");
      }
    } else if (step === 2) {
      if (eventLocationAddress) {
        setStep(step + 1);
      } else {
        toast.error('Veuillez sélectionner un lieu sur la carte.');
      }
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => setStep(step - 1);

  // Gérer la déconnexion
  const handleLogout = () => {
    const fullName = `${user?.nom || '[Nom non trouvé]'} `;
    showConfirmationToast(
      `${fullName}, êtes-vous sûr de vouloir vous déconnecter ?`,
      () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    );
  };

  // Convertir les coordonnées en adresse lisible
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setEventLocationAddress(data.display_name);
      } else {
        setEventLocationAddress('Adresse non trouvée');
      }
    } catch (error) {
      toast.error('Erreur lors du géocodage inverse');
      setEventLocationAddress('Erreur de géocodage');
    }
  };

  // Composant pour le marqueur de localisation
  const LocationMarker = () => {
    useMapEvents({
      async click(e) {
        setEventLocation(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    return eventLocation === null ? null : <Marker position={eventLocation}></Marker>;
  };

  // Supprimer un événement
  const handleDelete = (eventId) => {
    const fullName = `${user?.nom || '[Nom non trouvé]'} ${user?.prenom || '[Prénom non trouvé]'}`;
    showConfirmationToast(
      `${fullName}, êtes-vous sûr de vouloir supprimer cet événement ?`,
      async () => {
        try {
          const response = await axios.delete(`http://localhost:3800/evenements/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 200) {
            toast.success('Événement supprimé avec succès');
            fetchEvents();
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Erreur inconnue lors de la suppression';
          toast.error(`Erreur lors de la suppression de l'événement: ${errorMsg}`);
        }
      }
    );
  };

  // Éditer un événement
  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEventName(event.eventName);
    setEventDate(event.eventDate);
    setStartTime(event.startTime);
    setEventLocationAddress(event.eventLocation);
    setTicketNumber(event.ticketNumber);
    setTicketPrice(event.ticketPrice);
    setEventImage(event.eventImage);
    setStep(1);
  };

  return (
    <div className="activites-sportives">
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
          <button className="logout-button btn btn-link" onClick={handleLogout} title="Déconnexion">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      <main className="activites-content">
        <div className="container-fluid">
          <div className="row">
            {/* Formulaire de création ou édition d'événement */}
            <div className="col-md-6">
              <div className="form-container">
                <div className="form-section">
                  <form className="content-form">
                    <h2>{selectedEvent ? 'Modifier un Événement' : 'Créer un Événement'}</h2>

                    {/* Étape 1 : Nom, date, heure de début */}
                    {step === 1 && (
                      <>
                        <div className="form-group">
                          <label>Nom de l'événement</label>
                          <input
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Nom de l'événement"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Date de l'événement</label>
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Heure de début</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-actions">
                          <button type="button" className="btn btn-primary" onClick={handleNext}>Suivant</button>
                        </div>
                      </>
                    )}

                    {/* Étape 2 : Lieu de l'événement */}
                    {step === 2 && (
                      <>
                        <div className="form-group">
                          <label>Lieu de l'événement</label>
                          <input
                            type="text"
                            value={eventLocationAddress}
                            onChange={(e) => setEventLocationAddress(e.target.value)}
                            placeholder="Cliquez sur la carte pour sélectionner un lieu"
                            readOnly
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Carte</label>
                          <MapContainer
                            center={[36.8065, 10.1815]}
                            zoom={13}
                            style={{ height: '300px', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker />
                          </MapContainer>
                        </div>

                        <div className="form-actions">
                          <button type="button" className="btn btn-secondary" onClick={handleBack}>Retour</button>
                          <button type="button" className="btn btn-primary" onClick={handleNext}>Suivant</button>
                        </div>
                      </>
                    )}

                    {/* Étape 3 : Tickets, prix et image */}
                    {step === 3 && (
                      <>
                        <div className="form-group">
                          <label>Nombre de tickets</label>
                          <input
                            type="number"
                            value={ticketNumber}
                            onChange={(e) => setTicketNumber(e.target.value)}
                            placeholder="Nombre de tickets"
                          />
                        </div>
                        <div className="form-group">
                          <label>Prix du ticket (TND)</label>
                          <input
                            type="number"
                            value={ticketPrice}
                            onChange={(e) => setTicketPrice(e.target.value)}
                            placeholder="Prix du ticket (0 pour gratuit)"
                            min="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>Image de l'événement</label>
                          <input
                            type="file"
                            onChange={(e) => setEventImage(e.target.files[0])}
                          />
                        </div>

                        <div className="form-actions">
                          <button type="button" className="btn btn-secondary" onClick={handleBack}>Retour</button>
                          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                            {selectedEvent ? 'Mettre à jour' : 'Publier'}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Liste des événements publiés avec pagination */}
            <div className="col-md-6">
              <h3 className="mb-4">Événements publiés</h3>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => {
                  const imageUrl = event.eventImage
                    ? `http://localhost:3800${event.eventImage.startsWith('/') ? event.eventImage : '/' + event.eventImage}`
                    : 'https://via.placeholder.com/150';

                  return (
                    <div key={event.id} className="card mb-3">
                      <div className="row g-0">
                        {/* Partie image */}
                        <div className="col-md-6">
                          <img
                            src={imageUrl}
                            alt={event.eventName}
                            className="img-fluid rounded-start"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150';
                            }}
                          />
                        </div>
                        {/* Partie informations */}
                        <div className="col-md-6">
                          <div className="card-body">
                            <h5 className="card-title">{event.eventName}</h5>
                            <p className="card-text">
                              📅 {event.eventDate}<br />
                              ⏰ {event.startTime}<br />
                              📍 {event.eventLocation}<br />
                              🎟️ {event.ticketsAvailable} tickets disponibles<br />
                              💵 {event.ticketPrice} TND
                            </p>
                          </div>
                          {/* Boutons d'actions */}
                          <div className="card-footer d-flex justify-content-between align-items-center">
                            <button className="icon-button" title="Supprimer" onClick={() => handleDelete(event.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                            <button className="icon-button" title="Modifier" onClick={() => handleEdit(event)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Aucun événement disponible pour le moment.</p>
              )}

              {/* Pagination avec icônes */}
              <div className="pagination d-flex justify-content-center align-items-center mt-4">
                <button
                  className="btn btn-link"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Page précédente"
                >
                  <i className="bi bi-chevron-left" style={{ color: '#00ffff', fontSize: '1.5rem' }}></i>
                </button>
                <span className="page-info mx-3">
                  Page {currentPage} sur {Math.ceil(events.length / eventsPerPage)}
                </span>
                <button
                  className="btn btn-link"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === Math.ceil(events.length / eventsPerPage)}
                  title="Page suivante"
                >
                  <i className="bi bi-chevron-right" style={{ color: '#00ffff', fontSize: '1.5rem' }}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEventPage;