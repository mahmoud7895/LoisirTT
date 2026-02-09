import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

const InscriptionEvenement = () => {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editingInscription, setEditingInscription] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [newInscription, setNewInscription] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    age: '',
    beneficiaire: 'Agent TT',
    eventname: '',
    eventId: null,
    payment: '',
    numberOfTickets: 1,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState('Participants aux Événements');
  const [addStep, setAddStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  const API_BASE_URL = 'http://localhost:3800';

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const validateMatricule = (matricule) => {
    return /^\d{4,5}$/.test(matricule);
  };

  const calculateTotalAmount = (eventName, numberOfTickets) => {
    const event = evenements.find((e) => e.eventName === eventName);
    return event && numberOfTickets > 0 ? numberOfTickets * event.ticketPrice : 0;
  };

  const fetchInscriptions = useCallback(async (isMounted) => {
    if (!token) {
      toast.error('Vous devez être connecté pour accéder à cette page.');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error('Seul un administrateur peut consulter toutes les inscriptions.');
        }
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorData.message || 'Erreur lors de la récupération des inscriptions');
      }
      const data = await response.json();
      if (isMounted) {
        setInscriptions(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la récupération des inscriptions');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [token, navigate]);

  const fetchEvenements = useCallback(async (isMounted) => {
    if (!token) {
      toast.error('Vous devez être connecté pour accéder à cette page.');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/evenements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorData.message || 'Erreur lors de la récupération des événements');
      }
      const data = await response.json();
      if (isMounted) {
        setEvenements(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la récupération des événements');
    }
  }, [token, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.all([
        fetchInscriptions(isMounted),
        fetchEvenements(isMounted)
      ]);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchInscriptions, fetchEvenements]);

  const filteredInscriptions = inscriptions
    .filter((inscription) => {
      if (!searchTerm) return true;
      return inscription.matricule && inscription.matricule.toString().startsWith(searchTerm);
    })
    .sort((a, b) => {
      const getStatus = (eventStatus) => {
        if (!eventStatus) return 'non_assigné';
        return eventStatus.toLowerCase();
      };

      const statusA = getStatus(a.eventStatus);
      const statusB = getStatus(b.eventStatus);

      const priority = {
        'en cours': 1,
        non_assigné: 2,
        expiré: 3,
      };

      return priority[statusA] - priority[statusB];
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInscriptions = filteredInscriptions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleLogout = () => {
    const fullName = `${user?.nom || '[Nom]'} ${user?.prenom || '[Prénom]'}`;
    const toastId = toast.info(
      <div>
        <p>{fullName}, êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              if (toast.isActive(toastId)) toast.dismiss(toastId);
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
            onClick={() => {
              if (toast.isActive(toastId)) toast.dismiss(toastId);
            }}
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

  const handleDelete = async (id) => {
    const toastId = toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer cette inscription ?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/inscription/${id}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  if (response.status === 403) {
                    throw new Error('Seul un administrateur peut supprimer une inscription.');
                  }
                  if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                  }
                  throw new Error(errorData.message || 'Erreur lors de la suppression');
                }
                fetchInscriptions(true);
                toast.success('Inscription supprimée avec succès');
                if (toast.isActive(toastId)) toast.dismiss(toastId);
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error(error.message || 'Erreur lors de la suppression');
              }
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
            onClick={() => {
              if (toast.isActive(toastId)) toast.dismiss(toastId);
            }}
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

  const handleAddInscription = async (e) => {
    e.preventDefault();
    if (!validateMatricule(newInscription.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!newInscription.nom.trim() || !newInscription.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    if (!newInscription.eventId) {
      toast.error("L'identifiant de l'événement est requis.");
      return;
    }
    if (!user.id) {
      toast.error("L'identifiant de l'utilisateur est manquant. Veuillez vous reconnecter.");
      return;
    }
    try {
      const event = evenements.find((e) => e.eventName === newInscription.eventname);
      if (!event) {
        throw new Error("L'événement spécifié n'existe pas");
      }
      if (newInscription.numberOfTickets > event.ticketsAvailable) {
        throw new Error(`Il ne reste que ${event.ticketsAvailable} tickets disponibles.`);
      }

      const payload = {
        matricule: newInscription.matricule,
        nom: newInscription.nom.trim(),
        prenom: newInscription.prenom.trim(),
        age: newInscription.beneficiaire === 'enfant' ? Number(newInscription.age) : null,
        beneficiaire: newInscription.beneficiaire,
        eventname: newInscription.eventname,
        eventId: Number(newInscription.eventId),
        userId: Number(user.id),
        payment: newInscription.payment,
        numberOfTickets: Number(newInscription.numberOfTickets),
        totalAmount: calculateTotalAmount(newInscription.eventname, newInscription.numberOfTickets),
      };

      const response = await fetch(`${API_BASE_URL}/inscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorData.message || "Erreur lors de l'ajout de l'inscription");
      }

      setNewInscription({
        matricule: '',
        nom: '',
        prenom: '',
        age: '',
        beneficiaire: 'Agent TT',
        eventname: '',
        eventId: null,
        payment: '',
        numberOfTickets: 1,
        totalAmount: 0,
      });
      setShowAddPopup(false);
      setAddStep(1);
      fetchInscriptions(true);
      toast.success('Inscription ajoutée avec succès');
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'inscription:", error);
      toast.error(error.message || "Erreur lors de l'ajout de l'inscription");
    }
  };

  const handleEdit = (id) => {
    const inscriptionToEdit = inscriptions.find((inscription) => inscription.id === id);
    if (!inscriptionToEdit) {
      toast.error('Inscription introuvable');
      return;
    }
    const event = evenements.find((e) => e.eventName === inscriptionToEdit.eventname);
    setEditingInscription({
      id: inscriptionToEdit.id,
      matricule: inscriptionToEdit.matricule || '',
      nom: inscriptionToEdit.nom || '',
      prenom: inscriptionToEdit.prenom || '',
      age: inscriptionToEdit.age || '',
      beneficiaire: inscriptionToEdit.beneficiaire || 'Agent TT',
      eventname: inscriptionToEdit.eventname || '',
      eventId: event ? Number(event.id) : null,
      payment: inscriptionToEdit.payment || '',
      numberOfTickets: inscriptionToEdit.numberOfTickets || 1,
      totalAmount: inscriptionToEdit.totalAmount || 0,
      eventStatus: inscriptionToEdit.eventStatus || 'En cours',
    });
    setShowEditPopup(true);
    setEditStep(1);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!validateMatricule(editingInscription.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingInscription.nom.trim() || !editingInscription.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    if (!editingInscription.eventId) {
      toast.error("L'identifiant de l'événement est requis.");
      return;
    }
    try {
      const event = evenements.find((e) => e.eventName === editingInscription.eventname);
      if (!event) {
        throw new Error("L'événement spécifié n'existe pas");
      }
      if (editingInscription.numberOfTickets > event.ticketsAvailable) {
        throw new Error(`Il ne reste que ${event.ticketsAvailable} tickets disponibles.`);
      }

      const payload = {
        matricule: editingInscription.matricule,
        nom: editingInscription.nom.trim(),
        prenom: editingInscription.prenom.trim(),
        age: editingInscription.beneficiaire === 'enfant' ? Number(editingInscription.age) : null,
        beneficiaire: editingInscription.beneficiaire,
        eventname: editingInscription.eventname,
        eventId: Number(editingInscription.eventId),
        payment: editingInscription.payment,
        numberOfTickets: Number(editingInscription.numberOfTickets),
        totalAmount: calculateTotalAmount(editingInscription.eventname, editingInscription.numberOfTickets),
        eventStatus: editingInscription.eventStatus,
      };

      const response = await fetch(`${API_BASE_URL}/inscription/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error('Seul un administrateur peut modifier une inscription.');
        }
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      setShowEditPopup(false);
      setEditingInscription(null);
      setEditStep(1);
      fetchInscriptions(true);
      toast.success('Inscription mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
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
            <button onClick={() => navigateTo('/admin', 'Accueil')} className={activeButton === 'Accueil' ? 'active' : ''}>
              Accueil
            </button>
            <button onClick={() => navigateTo('/admin/clubs', 'Clubs')} className={activeButton === 'Clubs' ? 'active' : ''}>
              Clubs
            </button>
            <button onClick={() => navigateTo('/admin/activites-sportives', 'Activités sportives')} className={activeButton === 'Activités sportives' ? 'active' : ''}>
              Activités sportives
            </button>
            <button onClick={() => navigateTo('/admin/evenements', 'Événements')} className={activeButton === 'Événements' ? 'active' : ''}>
              Événements
            </button>
            <button onClick={() => navigateTo('/admin/inscription_evenement', 'Participants aux Événements')} className={activeButton === 'Participants aux Événements' ? 'active' : ''}>
              Participants aux Événements
            </button>
            <button
              onClick={() => navigateTo('/admin/reviews', 'Avis')}
              className={activeButton === 'Avis' ? 'active' : ''}
            >
              Avis
            </button>
            <button onClick={() => navigateTo('/admin/compte', 'Compte')} className={activeButton === 'Compte' ? 'active' : ''}>
              Compte
            </button>
            <button onClick={() => navigateTo('/admin/dashboard', 'Dashboard')} className={activeButton === 'Dashboard' ? 'active' : ''}>
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
        {showAddPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Ajouter une inscription</h2>
                <form onSubmit={addStep === 1 ? (e) => e.preventDefault() : handleAddInscription} className="form-grid">
                  {addStep === 1 && (
                    <>
                      <div className="form-group">
                        <label>Matricule *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newInscription.matricule}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,5}$/.test(value)) {
                              setNewInscription({ ...newInscription, matricule: value });
                            }
                          }}
                          required
                          placeholder="Entrez un matricule (4-5 chiffres)"
                          maxLength="5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newInscription.nom}
                          onChange={(e) => setNewInscription({ ...newInscription, nom: e.target.value })}
                          required
                          placeholder="Entrez le nom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newInscription.prenom}
                          onChange={(e) => setNewInscription({ ...newInscription, prenom: e.target.value })}
                          required
                          placeholder="Entrez le prénom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Bénéficiaire *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={newInscription.beneficiaire}
                            onChange={(e) => setNewInscription({ ...newInscription, beneficiaire: e.target.value })}
                            required
                          >
                            <option value="Agent TT">Agent TT</option>
                            <option value="enfant">Enfant</option>
                          </select>
                        </div>
                      </div>
                      {newInscription.beneficiaire === 'enfant' && (
                        <div className="form-group">
                          <label>Âge *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newInscription.age}
                            onChange={(e) => setNewInscription({ ...newInscription, age: e.target.value })}
                            required
                            min="3"
                            max="17"
                            placeholder="Entrez l'âge"
                          />
                        </div>
                      )}
                      <div className="form-actions full-width">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowAddPopup(false)}
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setAddStep(2)}
                        >
                          Suivant
                        </button>
                      </div>
                    </>
                  )}
                  {addStep === 2 && (
                    <>
                      <div className="form-group">
                        <label>Événement *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={newInscription.eventname}
                            onChange={(e) => {
                              const selectedEvent = evenements.find((ev) => ev.eventName === e.target.value);
                              setNewInscription({
                                ...newInscription,
                                eventname: e.target.value,
                                eventId: selectedEvent ? Number(selectedEvent.id) : null,
                              });
                            }}
                            required
                          >
                            <option value="">Sélectionnez un événement</option>
                            {evenements.map((evenement) => (
                              <option key={evenement.id} value={evenement.eventName}>
                                {evenement.eventName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Nombre de tickets *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newInscription.numberOfTickets}
                          onChange={(e) => setNewInscription({ ...newInscription, numberOfTickets: Math.max(1, Number(e.target.value)) })}
                          required
                          min="1"
                          placeholder="Entrez le nombre de tickets"
                        />
                      </div>
                      <div className="form-group">
                        <label>Montant total (TND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={calculateTotalAmount(newInscription.eventname, newInscription.numberOfTickets)}
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Paiement *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={newInscription.payment}
                            onChange={(e) => setNewInscription({ ...newInscription, payment: e.target.value })}
                            required
                          >
                            <option value="">Sélectionnez un mode de paiement</option>
                            <option value="creditCard">Carte de crédit</option>
                            <option value="paypal">PayPal</option>
                            <option value="cash">Espèces</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions full-width">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setAddStep(1)}
                        >
                          Retour
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowAddPopup(false)}
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditPopup && editingInscription && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Modifier l'inscription</h2>
                <form onSubmit={editStep === 1 ? (e) => e.preventDefault() : (e) => handleUpdate(e, editingInscription.id)} className="form-grid">
                  {editStep === 1 && (
                    <>
                      <div className="form-group">
                        <label>Matricule *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingInscription.matricule}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,5}$/.test(value)) {
                              setEditingInscription({ ...editingInscription, matricule: value });
                            }
                          }}
                          required
                          placeholder="Entrez un matricule (4-5 chiffres)"
                          maxLength="5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingInscription.nom}
                          onChange={(e) => setEditingInscription({ ...editingInscription, nom: e.target.value })}
                          required
                          placeholder="Entrez le nom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingInscription.prenom}
                          onChange={(e) => setEditingInscription({ ...editingInscription, prenom: e.target.value })}
                          required
                          placeholder="Entrez le prénom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Bénéficiaire *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={editingInscription.beneficiaire}
                            onChange={(e) => setEditingInscription({ ...editingInscription, beneficiaire: e.target.value })}
                            required
                          >
                            <option value="Agent TT">Agent TT</option>
                            <option value="enfant">Enfant</option>
                          </select>
                        </div>
                      </div>
                      {editingInscription.beneficiaire === 'enfant' && (
                        <div className="form-group">
                          <label>Âge *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editingInscription.age}
                            onChange={(e) => setEditingInscription({ ...editingInscription, age: e.target.value })}
                            required
                            min="3"
                            max="17"
                            placeholder="Entrez l'âge"
                          />
                        </div>
                      )}
                      <div className="form-actions full-width">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEditPopup(false)}
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setEditStep(2)}
                        >
                          Suivant
                        </button>
                      </div>
                    </>
                  )}
                  {editStep === 2 && (
                    <>
                      <div className="form-group">
                        <label>Événement *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={editingInscription.eventname}
                            onChange={(e) => {
                              const selectedEvent = evenements.find((ev) => ev.eventName === e.target.value);
                              setEditingInscription({
                                ...editingInscription,
                                eventname: e.target.value,
                                eventId: selectedEvent ? Number(selectedEvent.id) : null,
                              });
                            }}
                            required
                          >
                            <option value="">Sélectionnez un événement</option>
                            {evenements.map((evenement) => (
                              <option key={evenement.id} value={evenement.eventName}>
                                {evenement.eventName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Nombre de tickets *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingInscription.numberOfTickets}
                          onChange={(e) => setEditingInscription({ ...editingInscription, numberOfTickets: Math.max(1, Number(e.target.value)) })}
                          required
                          min="1"
                          placeholder="Entrez le nombre de tickets"
                        />
                      </div>
                      <div className="form-group">
                        <label>Montant total (TND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={calculateTotalAmount(editingInscription.eventname, editingInscription.numberOfTickets)}
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Paiement *</label>
                        <div className="select-container">
                          <select
                            className="form-control"
                            value={editingInscription.payment}
                            onChange={(e) => setEditingInscription({ ...editingInscription, payment: e.target.value })}
                            required
                          >
                            <option value="">Sélectionnez un mode de paiement</option>
                            <option value="creditCard">Carte de crédit</option>
                            <option value="paypal">PayPal</option>
                            <option value="cash">Espèces</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions full-width">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditStep(1)}
                        >
                          Retour
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEditPopup(false)}
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="search-and-table-container">
          <div className="search-bar">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher par matricule (4-5 chiffres)"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d{0,5}$/.test(value)) {
                  setSearchTerm(value);
                }
              }}
              className="search-input"
              maxLength="5"
            />
          </div>
          <br />
          <div className="table-container">
            <h2>Liste des Personnels TT participants aux événements :</h2>
            <br />
            {loading ? (
              <p className="text-center">Chargement en cours...</p>
            ) : (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Âge</th>
                      <th>Bénéficiaire</th>
                      <th>Événement</th>
                      <th>Nombre de tickets</th>
                      <th>Montant total</th>
                      <th>Paiement</th>
                      <th>Date d'inscription</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={13} style={{ textAlign: 'center', padding: '20px' }}>
                          <p>Aucune inscription trouvée.</p>
                          <button
                            className="icon-button add-alone"
                            onClick={() => setShowAddPopup(true)}
                            title="Ajouter une inscription"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentInscriptions.map((inscription) => (
                        <tr key={inscription.id} className={inscription.eventStatus === 'Expiré' ? 'table-warning' : ''}>
                          <td>{inscription.matricule || 'N/A'}</td>
                          <td>{inscription.nom || 'N/A'}</td>
                          <td>{inscription.prenom || 'N/A'}</td>
                          <td>
                            {inscription.beneficiaire === 'Agent TT' ? (
                              <i className="bi bi-dash" title="Âge non applicable" />
                            ) : (
                              inscription.age || 'N/A'
                            )}
                          </td>
                          <td>{inscription.beneficiaire || 'N/A'}</td>
                          <td>
                            {inscription.eventname || 'N/A'}{' '}
                            <span className={inscription.eventStatus === 'Expiré' ? 'text-danger' : 'text-success'}>
                              ({inscription.eventStatus || 'N/A'})
                            </span>
                          </td>
                          <td>{inscription.numberOfTickets || 'N/A'}</td>
                          <td>{inscription.totalAmount || 'N/A'} TND</td>
                          <td>{inscription.payment || 'N/A'}</td>
                          <td>
                            {inscription.date_inscription
                              ? new Date(inscription.date_inscription).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td style={{ width: '120px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                className="icon-button"
                                onClick={() => handleEdit(inscription.id)}
                                title="Modifier"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => handleDelete(inscription.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => setShowAddPopup(true)}
                                title="Ajouter"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {filteredInscriptions.length > itemsPerPage && (
                  <div className="pagination d-flex justify-content-center align-items-center mt-4">
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Page précédente"
                    >
                      <i className="bi bi-chevron-left" style={{ color: '#00ffff', fontSize: '1.5rem' }} />
                    </button>
                    <span className="page-info me-2">
                      Page {currentPage} sur {Math.ceil(filteredInscriptions.length / itemsPerPage)}
                    </span>
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredInscriptions.length / itemsPerPage)}
                      title="Page suivante"
                    >
                      <i className="bi bi-chevron-right" style={{ color: '#00ffff', fontSize: '1.5rem' }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InscriptionEvenement;