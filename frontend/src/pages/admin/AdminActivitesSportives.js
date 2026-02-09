import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

const AdminActivitesSportives = () => {
  const navigate = useNavigate();
  const [activites, setActivites] = useState([]);
  const [typesActivite, setTypesActivite] = useState([]);
  const [newTypeActivite, setNewTypeActivite] = useState('');
  const [editingTypeActivite, setEditingTypeActivite] = useState({ id: null, nom: '' });
  const [editingActivite, setEditingActivite] = useState({
    id: null,
    matricule: '',
    nom: '',
    prenom: '',
    age: '',
    beneficiaire: 'Agent TT',
    type_activite_id: null,
  });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showTypeActivitePopup, setShowTypeActivitePopup] = useState(false);
  const [showEditTypePopup, setShowEditTypePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeButton, setActiveButton] = useState('Activités sportives');
  const itemsPerPage = 5;

  const API_BASE_URL = 'http://localhost:3800';

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const fetchData = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      console.error(`Erreur fetchData ${url}:`, error);
      toast.error(`Erreur lors de la récupération des données: ${error.message}`);
      return [];
    }
  }, []);

  const fetchActivitesAndTypes = useCallback(async () => {
    setLoading(true);
    try {
      const [activitesData, typesData] = await Promise.all([
        fetchData(`${API_BASE_URL}/activites-sportives`),
        fetchData(`${API_BASE_URL}/type-activite-sportive`),
      ]);

      setActivites(activitesData);
      setTypesActivite(typesData);
    } catch (error) {
      console.error('Erreur fetchActivitesAndTypes:', error);
      toast.error(`Échec du chargement des données: ${error.message}`);
      setActivites([]);
      setTypesActivite([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchActivitesAndTypes();
  }, [fetchActivitesAndTypes]);

  const validateMatricule = (matricule) => {
    return /^\d{4,5}$/.test(matricule);
  };

  const handleAddTypeActivite = async (e) => {
    e.preventDefault();
    if (!newTypeActivite.trim()) {
      toast.error('Le nom du type ne peut pas être vide');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/type-activite-sportive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newTypeActivite.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      setNewTypeActivite('');
      await fetchActivitesAndTypes();
      toast.success('Type ajouté avec succès');
    } catch (error) {
      console.error('Erreur ajout type:', error);
      toast.error(`Échec de l'ajout: ${error.message}`);
    }
  };

  const handleEditTypeActivite = (id) => {
    const typeToEdit = typesActivite.find((type) => type.id === id);
    if (!typeToEdit) {
      toast.error('Type introuvable');
      return;
    }
    setEditingTypeActivite({ id: typeToEdit.id, nom: typeToEdit.nom });
    setShowEditTypePopup(true);
  };

  const handleUpdateTypeActivite = async (e) => {
    e.preventDefault();
    if (!editingTypeActivite.nom.trim()) {
      toast.error('Le nom du type ne peut pas être vide');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/type-activite-sportive/${editingTypeActivite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: editingTypeActivite.nom.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      setEditingTypeActivite({ id: null, nom: '' });
      setShowEditTypePopup(false);
      await fetchActivitesAndTypes();
      toast.success('Type mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour type:', error);
      toast.error(`Échec de la mise à jour: ${error.message}`);
    }
  };

const handleDeleteTypeActivite = async (id) => {
  const typeToDelete = typesActivite.find((type) => type.id === id);
  if (!typeToDelete) {
    toast.error('Type introuvable');
    return;
  }

  toast.info(
    <div>
      <p>Voulez-vous vraiment archiver ce type d'activité ?</p>
      <div className="confirmation-buttons">
        <button
          onClick={async () => {
            try {
              // Supprimer le type, l'archivage est géré par le backend
              const deleteResponse = await fetch(`${API_BASE_URL}/type-activite-sportive/${id}`, {
                method: 'DELETE',
              });

              if (!deleteResponse.ok) {
                const deleteError = await deleteResponse.json();
                throw new Error(`Échec de la suppression: ${deleteError.message || deleteResponse.statusText}`);
              }

              await fetchActivitesAndTypes();
              toast.success('Type archivé et supprimé');
              toast.dismiss();
            } catch (error) {
              console.error('Erreur détaillée:', error);
              toast.error(`Échec: ${error.message}`);
            }
          }}
          className="btn btn-danger"
        >
          Confirmer
        </button>
        <button onClick={() => toast.dismiss()} className="btn btn-secondary">
          Annuler
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      closeButton: false,
      position: 'top-center',
    }
  );
};

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer cette activité ?</p>
        <div className="confirmation-buttons">
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/activites-sportives/${id}`, {
                  method: 'DELETE',
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                await fetchActivitesAndTypes();
                toast.success('Activité supprimée');
                toast.dismiss();
              } catch (error) {
                console.error('Erreur suppression:', error);
                toast.error(`Échec: ${error.message}`);
              }
            }}
            className="btn btn-danger"
          >
            Oui
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-secondary">
            Non
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: 'top-center',
      }
    );
  };

  const handleEdit = (id) => {
    const activiteToEdit = activites.find((activite) => activite.id === id);
    if (!activiteToEdit) {
      toast.error('Activité introuvable');
      return;
    }

    setEditingActivite({
      id: activiteToEdit.id,
      matricule: activiteToEdit.matricule || '',
      nom: activiteToEdit.nom || '',
      prenom: activiteToEdit.prenom || '',
      age: activiteToEdit.age || '',
      beneficiaire: activiteToEdit.beneficiaire || 'Agent TT',
      type_activite_id: activiteToEdit.type_activite_id || null,
    });
    setShowEditPopup(true);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!validateMatricule(editingActivite.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingActivite.nom.trim() || !editingActivite.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }

    try {
      const payload = {
        matricule: editingActivite.matricule,
        nom: editingActivite.nom.trim(),
        prenom: editingActivite.prenom.trim(),
        age: editingActivite.beneficiaire === 'enfant' ? Number(editingActivite.age) : null,
        beneficiaire: editingActivite.beneficiaire,
        type_activite_id: editingActivite.type_activite_id || null,
      };

      const response = await fetch(`${API_BASE_URL}/activites-sportives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      setShowEditPopup(false);
      setEditingActivite({
        id: null,
        matricule: '',
        nom: '',
        prenom: '',
        age: '',
        beneficiaire: 'Agent TT',
        type_activite_id: null,
      });
      await fetchActivitesAndTypes();
      toast.success('Activité mise à jour');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error(`Échec: ${error.message}`);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateMatricule(editingActivite.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingActivite.nom.trim() || !editingActivite.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }

    try {
      const payload = {
        matricule: editingActivite.matricule,
        nom: editingActivite.nom.trim(),
        prenom: editingActivite.prenom.trim(),
        age: editingActivite.beneficiaire === 'enfant' ? Number(editingActivite.age) : null,
        beneficiaire: editingActivite.beneficiaire,
        type_activite_id: editingActivite.type_activite_id || null,
      };

      const response = await fetch(`${API_BASE_URL}/activites-sportives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }

      setShowAddPopup(false);
      setEditingActivite({
        id: null,
        matricule: '',
        nom: '',
        prenom: '',
        age: '',
        beneficiaire: 'Agent TT',
        type_activite_id: null,
      });
      await fetchActivitesAndTypes();
      toast.success('Activité ajoutée');
    } catch (error) {
      console.error("Erreur ajout:", error);
      toast.error(`Échec: ${error.message}`);
    }
  };

  const handleLogout = () => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="confirmation-buttons">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              toast.dismiss();
            }}
            className="btn btn-danger"
          >
            Oui
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-secondary">
            Non
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: 'top-center',
      }
    );
  };

  const filteredActivites = activites
    .filter((activite) =>
      !searchTerm || (activite.matricule && activite.matricule.toString().startsWith(searchTerm))
    )
    .sort((a, b) => {
      const getStatus = (typeActiviteNomEtat) => {
        if (!typeActiviteNomEtat) return 'non_assigné';
        const statusMatch = typeActiviteNomEtat.match(/\((.*?)\)$/);
        return statusMatch ? statusMatch[1].toLowerCase() : 'non_assigné';
      };

      const statusA = getStatus(a.type_activite_nom_etat);
      const statusB = getStatus(b.type_activite_nom_etat);

      const priority = {
        'en cours': 1,
        non_assigné: 2,
        expiré: 3,
      };

      return priority[statusA] - priority[statusB];
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivites = filteredActivites.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatTypeActiviteName = (typeActiviteNomEtat) => {
    if (!typeActiviteNomEtat) return 'Non assigné';

    const statusMatch = typeActiviteNomEtat.match(/\((.*?)\)$/);
    if (!statusMatch) return typeActiviteNomEtat;

    const name = typeActiviteNomEtat.replace(/\s*\(.*?\)$/, '');
    const status = statusMatch[1];
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    return (
      <>
        {name}{' '}
        <span className={capitalizedStatus === 'Expiré' ? 'text-danger' : 'text-success'}>
          ({capitalizedStatus})
        </span>
      </>
    );
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
        <div className="search-and-add-container">
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
          <button className="add-button ms-2" onClick={() => setShowTypeActivitePopup(true)}>
            Gérer les activités 
          </button>
        </div>

        {showTypeActivitePopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="add-type-club-popup">
                <h2>Gestion des activités sportives</h2>
                <form onSubmit={handleAddTypeActivite} className="add-type-club-form">
                  <input
                    type="text"
                    value={newTypeActivite}
                    onChange={(e) => setNewTypeActivite(e.target.value)}
                    placeholder="Entrez un nouveau type d'activité"
                    required
                  />
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                </form>

                <h3 className="mt-4">Liste des activités sportives</h3>
                {typesActivite.length === 0 ? (
                  <p className="text-center">Aucun activité ajouté.</p>
                ) : (
                  <ul className="type-club-list">
                    {typesActivite.map((type) => (
                      <li key={type.id} className="type-club-item">
                        {type.nom}
                        <button
                          className="icon-button"
                          onClick={() => handleEditTypeActivite(type.id)}
                          title="Modifier"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteTypeActivite(type.id)}
                          title="Archiver"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="btn btn-secondary mt-3"
                  onClick={() => setShowTypeActivitePopup(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditTypePopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Modifier l'activité</h2>
                <form onSubmit={handleUpdateTypeActivite}>
                  <div className="form-group">
                    <label>Nom d'activité</label>
                    <input
                      type="text"
                      value={editingTypeActivite.nom}
                      onChange={(e) => setEditingTypeActivite({ ...editingTypeActivite, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom du type"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Enregistrer</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditTypePopup(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showAddPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Ajouter une activité sportive</h2>
                <form onSubmit={handleAddSubmit}>
                  <div className="form-group">
                    <label>Matricule *</label>
                    <input
                      type="text"
                      value={editingActivite.matricule}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d{0,5}$/.test(value)) {
                          setEditingActivite({ ...editingActivite, matricule: value });
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
                      value={editingActivite.nom}
                      onChange={(e) => setEditingActivite({ ...editingActivite, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={editingActivite.prenom}
                      onChange={(e) => setEditingActivite({ ...editingActivite, prenom: e.target.value })}
                      required
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bénéficiaire *</label>
                    <div className="select-container">
                      <select
                        value={editingActivite.beneficiaire}
                        onChange={(e) => setEditingActivite({ ...editingActivite, beneficiaire: e.target.value })}
                        required
                      >
                        <option value="Agent TT">Agent TT</option>
                        <option value="enfant">Enfant</option>
                      </select>
                    </div>
                  </div>
                  {editingActivite.beneficiaire === 'enfant' && (
                    <div className="form-group">
                      <label>Âge *</label>
                      <input
                        type="number"
                        min="3"
                        max="17"
                        value={editingActivite.age}
                        onChange={(e) => setEditingActivite({ ...editingActivite, age: e.target.value })}
                        required
                        placeholder="Entrez l'âge"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Type d'activité</label>
                    <div className="select-container">
                      <select
                        value={editingActivite.type_activite_id || ''}
                        onChange={(e) =>
                          setEditingActivite({
                            ...editingActivite,
                            type_activite_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      >
                        <option value="">Sélectionnez un type d'activité</option>
                        {typesActivite.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Ajouter</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddPopup(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Modifier l'activité sportive</h2>
                <form onSubmit={(e) => handleUpdate(e, editingActivite.id)}>
                  <div className="form-group">
                    <label>Matricule *</label>
                    <input
                      type="text"
                      value={editingActivite.matricule}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d{0,5}$/.test(value)) {
                          setEditingActivite({ ...editingActivite, matricule: value });
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
                      value={editingActivite.nom}
                      onChange={(e) => setEditingActivite({ ...editingActivite, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={editingActivite.prenom}
                      onChange={(e) => setEditingActivite({ ...editingActivite, prenom: e.target.value })}
                      required
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bénéficiaire *</label>
                    <div className="select-container">
                      <select
                        value={editingActivite.beneficiaire}
                        onChange={(e) => setEditingActivite({ ...editingActivite, beneficiaire: e.target.value })}
                        required
                      >
                        <option value="Agent TT">Agent TT</option>
                        <option value="enfant">Enfant</option>
                      </select>
                    </div>
                  </div>
                  {editingActivite.beneficiaire === 'enfant' && (
                    <div className="form-group">
                      <label>Âge *</label>
                      <input
                        type="number"
                        min="3"
                        max="17"
                        value={editingActivite.age}
                        onChange={(e) => setEditingActivite({ ...editingActivite, age: e.target.value })}
                        required
                        placeholder="Entrez l'âge"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Type d'activité</label>
                    <div className="select-container">
                      <select
                        value={editingActivite.type_activite_id || ''}
                        onChange={(e) =>
                          setEditingActivite({
                            ...editingActivite,
                            type_activite_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      >
                        <option value="">Sélectionnez un type d'activité</option>
                        {typesActivite.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Enregistrer</button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditPopup(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="search-and-table-container">
          <br />
          <div className="table-container">
            <h2>Liste des agents TT participants à des activités sportives :</h2>
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
                      <th>Type d'activité</th>
                      <th>Date d'inscription</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivites.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                          <p>Aucune activité trouvée.</p>
                          <button
                            className="icon-button"
                            onClick={() => {
                              setEditingActivite({
                                id: null,
                                matricule: '',
                                nom: '',
                                prenom: '',
                                age: '',
                                beneficiaire: 'Agent TT',
                                type_activite_id: null,
                              });
                              setShowAddPopup(true);
                            }}
                            title="Ajouter une activité"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentActivites.map((activite) => (
                        <tr key={activite.id}>
                          <td>{activite.matricule || 'N/A'}</td>
                          <td>{activite.nom || 'N/A'}</td>
                          <td>{activite.prenom || 'N/A'}</td>
                          <td>
                            {activite.beneficiaire === 'Agent TT' ? (
                              <i className="bi bi-dash" title="Âge non applicable"></i>
                            ) : (
                              activite.age || 'N/A'
                            )}
                          </td>
                          <td>{activite.beneficiaire || 'N/A'}</td>
                          <td>{formatTypeActiviteName(activite.type_activite_nom_etat)}</td>
                          <td>
                            {activite.date_inscription
                              ? new Date(activite.date_inscription).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td style={{ width: '120px', textAlign: 'center' }}>
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <button
                                className="icon-button"
                                onClick={() => handleEdit(activite.id)}
                                title="Modifier"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => handleDelete(activite.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => {
                                  setEditingActivite({
                                    id: null,
                                    matricule: '',
                                    nom: '',
                                    prenom: '',
                                    age: '',
                                    beneficiaire: 'Agent TT',
                                    type_activite_id: null,
                                  });
                                  setShowAddPopup(true);
                                }}
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

                {filteredActivites.length > itemsPerPage && (
                  <div className="pagination d-flex justify-content-center align-items-center mt-4">
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Page précédente"
                    >
                      <i className="bi bi-chevron-left" style={{ color: '#00ffff', fontSize: '1.5rem' }}></i>
                    </button>
                    <span className="page-info me-2">
                      Page {currentPage} sur {Math.ceil(filteredActivites.length / itemsPerPage)}
                    </span>
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredActivites.length / itemsPerPage)}
                      title="Page suivante"
                    >
                      <i className="bi bi-chevron-right" style={{ color: '#00ffff', fontSize: '1.5rem' }}></i>
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

export default AdminActivitesSportives;