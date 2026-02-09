import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

const AdminClubs = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [typesClub, setTypesClub] = useState([]);
  const [newTypeClub, setNewTypeClub] = useState('');
  const [editingClub, setEditingClub] = useState({
    id: null,
    matricule: '',
    nom: '',
    prenom: '',
    age: '',
    beneficiaire: 'Agent TT',
    type_club_id: null,
  });
  const [editingTypeClub, setEditingTypeClub] = useState({ id: null, name: '' });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showTypeClubPopup, setShowTypeClubPopup] = useState(false);
  const [showEditTypePopup, setShowEditTypePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeButton, setActiveButton] = useState('Clubs');
  const [hoveredButton, setHoveredButton] = useState(null);
  const itemsPerPage = 5;

  const API_BASE_URL = 'http://localhost:3800';

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const validateMatricule = (matricule) => {
    return /^\d{4,5}$/.test(matricule);
  };

  const fetchClubsAndTypes = async () => {
    setLoading(true);
    try {
      const clubsRes = await fetch(`${API_BASE_URL}/clubs`);
      if (!clubsRes.ok) throw new Error('Erreur lors de la récupération des clubs');
      const clubsData = await clubsRes.json();

      const typesRes = await fetch(`${API_BASE_URL}/type-clubs`);
      if (!typesRes.ok) throw new Error('Erreur lors de la récupération des types');
      const typesData = await typesRes.json();

      setClubs(clubsData);
      setTypesClub(typesData);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypesClub = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/type-clubs`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des types de clubs');
      const data = await response.json();
      setTypesClub(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des types de clubs');
    }
  };

  const handleAddTypeClub = async (e) => {
    e.preventDefault();
    if (!newTypeClub.trim()) {
      toast.error('Le nom du type de club ne peut pas être vide');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/type-clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeClub.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du type de club");
      }
      setNewTypeClub('');
      await fetchTypesClub();
      toast.success('Type de club ajouté avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || "Erreur lors de l'ajout du type de club");
    }
  };

  const handleEditTypeClub = (id) => {
    const typeToEdit = typesClub.find((type) => type.id === id);
    if (!typeToEdit) {
      toast.error('Type de club introuvable');
      return;
    }
    setEditingTypeClub({ id: typeToEdit.id, name: typeToEdit.name });
    setShowEditTypePopup(true);
  };

  const handleUpdateTypeClub = async (e) => {
    e.preventDefault();
    if (!editingTypeClub.name.trim()) {
      toast.error('Le nom du type de club ne peut pas être vide');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/type-clubs/${editingTypeClub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTypeClub.name.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du type de club");
      }
      setShowEditTypePopup(false);
      setEditingTypeClub({ id: null, name: '' });
      await fetchTypesClub();
      toast.success('Type de club mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || "Erreur lors de la mise à jour du type de club");
    }
  };

  const handleDeleteTypeClub = async (id) => {
    const typeToDelete = typesClub.find((type) => type.id === id);
    if (!typeToDelete) {
      toast.error('Type de club introuvable');
      return;
    }

    toast.info(
      <div>
        <p>
           Voulez-vous Supprimer ce club ?
        </p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/type-clubs/${id}`, {
                  method: 'DELETE',
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Échec de la suppression');
                }
                await fetchTypesClub();
                await fetchClubsAndTypes();
                toast.success(`Type de club supprimé, archivé et inscriptions marquées comme "${typeToDelete.name} (expiré)".`);
                toast.dismiss();
              } catch (error) {
                console.error('Erreur:', error);
                toast.error(error.message || 'Erreur lors de la suppression');
              }
            }}
            className="btn btn-danger"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="btn btn-secondary"
          >
            Annuler
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

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir supprimer ce club ?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/clubs/${id}`, {
                  method: 'DELETE',
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                fetchClubsAndTypes();
                toast.success('Club supprimé avec succès');
                toast.dismiss();
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error('Erreur lors de la suppression');
              }
            }}
            className="btn btn-danger"
          >
            Oui
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="btn btn-secondary"
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

  const handleEdit = (id) => {
    const clubToEdit = clubs.find((club) => club.id === id);
    if (!clubToEdit) {
      toast.error('Club introuvable');
      return;
    }
    setEditingClub({
      id: clubToEdit.id,
      matricule: clubToEdit.matricule || '',
      nom: clubToEdit.nom || '',
      prenom: clubToEdit.prenom || '',
      age: clubToEdit.age || '',
      beneficiaire: clubToEdit.beneficiaire || 'Agent TT',
      type_club_id: clubToEdit.type_club_id || null,
    });
    setShowEditPopup(true);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!validateMatricule(editingClub.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingClub.nom.trim() || !editingClub.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    try {
      const payload = {
        matricule: editingClub.matricule,
        nom: editingClub.nom.trim(),
        prenom: editingClub.prenom.trim(),
        age: editingClub.beneficiaire === 'enfant' ? Number(editingClub.age) : null,
        beneficiaire: editingClub.beneficiaire,
        type_club_id: editingClub.type_club_id || null,
      };

      const response = await fetch(`${API_BASE_URL}/clubs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
      setShowEditPopup(false);
      setEditingClub({
        id: null,
        matricule: '',
        nom: '',
        prenom: '',
        age: '',
        beneficiaire: 'Agent TT',
        type_club_id: null,
      });
      await fetchClubsAndTypes();
      toast.success('Club mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateMatricule(editingClub.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingClub.nom.trim() || !editingClub.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    try {
      const payload = {
        matricule: editingClub.matricule,
        nom: editingClub.nom.trim(),
        prenom: editingClub.prenom.trim(),
        age: editingClub.beneficiaire === 'enfant' ? Number(editingClub.age) : null,
        beneficiaire: editingClub.beneficiaire,
        type_club_id: editingClub.type_club_id || null,
      };

      const response = await fetch(`${API_BASE_URL}/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }
      setShowAddPopup(false);
      setEditingClub({
        id: null,
        matricule: '',
        nom: '',
        prenom: '',
        age: '',
        beneficiaire: 'Agent TT',
        type_club_id: null,
      });
      await fetchClubsAndTypes();
      toast.success('Club ajouté avec succès');
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const handleLogout = () => {
    toast.info(
      <div>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>

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
          <button
            onClick={() => toast.dismiss()}
            className="btn btn-secondary"
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

  const filteredClubs = clubs
    .filter((club) => {
      if (!searchTerm) return true;
      return club.matricule && club.matricule.toString().startsWith(searchTerm);
    })
    .sort((a, b) => {
      const getStatus = (typeClubNomEtat) => {
        if (!typeClubNomEtat) return 'non_assigné';
        const statusMatch = typeClubNomEtat.match(/\((.*?)\)$/);
        return statusMatch ? statusMatch[1].toLowerCase() : 'non_assigné';
      };

      const statusA = getStatus(a.type_club_nom_etat);
      const statusB = getStatus(b.type_club_nom_etat);

      // Priorité : en cours > non_assigné > expiré
      const priority = {
        'en cours': 1,
        non_assigné: 2,
        expiré: 3,
      };

      return priority[statusA] - priority[statusB];
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatTypeClubName = (typeClubNomEtat) => {
    if (!typeClubNomEtat) return 'Non assigné';

    const statusMatch = typeClubNomEtat.match(/\((.*?)\)$/);
    if (!statusMatch) return typeClubNomEtat;

    const name = typeClubNomEtat.replace(/\s*\(.*?\)$/, '');
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

  useEffect(() => {
    fetchClubsAndTypes();
  }, []);

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
          <button
            className="logout-button btn btn-link"
            onClick={handleLogout}
            title="Déconnexion"
          >
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
          <button
            className="add-button ms-2"
            onClick={() => setShowTypeClubPopup(true)}
          >
            Gérer les Clubs
          </button>
        </div>

        {showTypeClubPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="add-type-club-popup">
                <h2>Gestion des clubs</h2>
                <form onSubmit={handleAddTypeClub} className="add-type-club-form">
                  <input
                    type="text"
                    value={newTypeClub}
                    onChange={(e) => setNewTypeClub(e.target.value)}
                    placeholder="Entrez un nouveau type de club"
                    required
                  />
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                </form>

                <h3 className="mt-4">Liste des clubs</h3>
                {typesClub.length === 0 ? (
                  <p className="text-center">Aucun club ajouté.</p>
                ) : (
                  <ul className="type-club-list">
                    {typesClub.map((type) => (
                      <li key={type.id} className="type-club-item">
                        {type.name}
                        <button
                          className="icon-button"
                          onClick={() => handleEditTypeClub(type.id)}
                          title="Modifier"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteTypeClub(type.id)}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="btn btn-secondary mt-3"
                  onClick={() => setShowTypeClubPopup(false)}
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
                <h2>Modifier le club</h2>
                <form onSubmit={handleUpdateTypeClub}>
                  <div className="form-group">
                    <label>Nom du type *</label>
                    <input
                      type="text"
                      value={editingTypeClub.name}
                      onChange={(e) => setEditingTypeClub({ ...editingTypeClub, name: e.target.value })}
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
                <h2>Ajouter une inscription d'un agent TT</h2>
                <form onSubmit={handleAddSubmit}>
                  <div className="form-group">
                    <label>Matricule *</label>
                    <input
                      type="text"
                      value={editingClub.matricule}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d{0,5}$/.test(value)) {
                          setEditingClub({ ...editingClub, matricule: value });
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
                      value={editingClub.nom}
                      onChange={(e) => setEditingClub({ ...editingClub, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={editingClub.prenom}
                      onChange={(e) => setEditingClub({ ...editingClub, prenom: e.target.value })}
                      required
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bénéficiaire *</label>
                    <div className="select-container">
                      <select
                        value={editingClub.beneficiaire}
                        onChange={(e) => setEditingClub({ ...editingClub, beneficiaire: e.target.value })}
                        required
                      >
                        <option value="Agent TT">Agent TT</option>
                        <option value="enfant">Enfant</option>
                      </select>
                    </div>
                  </div>
                  {editingClub.beneficiaire === 'enfant' && (
                    <div className="form-group">
                      <label>Âge *</label>
                      <input
                        type="number"
                        min="3"
                        max="17"
                        value={editingClub.age}
                        onChange={(e) => setEditingClub({ ...editingClub, age: e.target.value })}
                        required
                        placeholder="Entrez l'âge"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Type de club</label>
                    <div className="select-container">
                      <select
                        value={editingClub.type_club_id || ''}
                        onChange={(e) =>
                          setEditingClub({
                            ...editingClub,
                            type_club_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      >
                        <option value="">Sélectionnez un type de club</option>
                        {typesClub.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
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
                <h2>Modifier une inscription d'un agent TT</h2>
                <form onSubmit={(e) => handleUpdate(e, editingClub.id)}>
                  <div className="form-group">
                    <label>Matricule *</label>
                    <input
                      type="text"
                      value={editingClub.matricule}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d{0,5}$/.test(value)) {
                          setEditingClub({ ...editingClub, matricule: value });
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
                      value={editingClub.nom}
                      onChange={(e) => setEditingClub({ ...editingClub, nom: e.target.value })}
                      required
                      placeholder="Entrez le nom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={editingClub.prenom}
                      onChange={(e) => setEditingClub({ ...editingClub, prenom: e.target.value })}
                      required
                      placeholder="Entrez le prénom"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bénéficiaire *</label>
                    <div className="select-container">
                      <select
                        value={editingClub.beneficiaire}
                        onChange={(e) => setEditingClub({ ...editingClub, beneficiaire: e.target.value })}
                        required
                      >
                        <option value="Agent TT">Agent TT</option>
                        <option value="enfant">Enfant</option>
                      </select>
                    </div>
                  </div>
                  {editingClub.beneficiaire === 'enfant' && (
                    <div className="form-group">
                      <label>Âge *</label>
                      <input
                        type="number"
                        min="3"
                        max="17"
                        value={editingClub.age}
                        onChange={(e) => setEditingClub({ ...editingClub, age: e.target.value })}
                        required
                        placeholder="Entrez l'âge"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Type de club</label>
                    <div className="select-container">
                      <select
                        value={editingClub.type_club_id || ''}
                        onChange={(e) =>
                          setEditingClub({
                            ...editingClub,
                            type_club_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      >
                        <option value="">Sélectionnez un type de club</option>
                        {typesClub.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
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
            <h2>Liste des agents TT participants à des clubs :</h2>
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
                      <th>Type de club</th>
                      <th>Date d'inscription</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClubs.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                          <p>Aucun club trouvé.</p>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: hoveredButton === 'add' ? '#7D00FF' : '#00ffff',
                              cursor: 'pointer',
                              fontSize: '2rem',
                              padding: '10px',
                              transition: 'all 0.3s',
                              transform: hoveredButton === 'add' ? 'scale(1.2)' : 'scale(1)',
                            }}
                            onMouseEnter={() => setHoveredButton('add')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => {
                              setEditingClub({
                                id: null,
                                matricule: '',
                                nom: '',
                                prenom: '',
                                age: '',
                                beneficiaire: 'Agent TT',
                                type_club_id: null,
                              });
                              setShowAddPopup(true);
                            }}
                            title="Ajouter un club"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentClubs.map((club) => (
                        <tr key={club.id}>
                          <td>{club.matricule || 'N/A'}</td>
                          <td>{club.nom || 'N/A'}</td>
                          <td>{club.prenom || 'N/A'}</td>
                          <td>
                            {club.beneficiaire === 'Agent TT' ? (
                              <i className="bi bi-dash" title="Âge non applicable" />
                            ) : (
                              club.age || 'N/A'
                            )}
                          </td>
                          <td>{club.beneficiaire || 'N/A'}</td>
                          <td>{formatTypeClubName(club.type_club_nom_etat)}</td>
                          <td>
                            {club.date_inscription
                              ? new Date(club.date_inscription).toLocaleDateString()
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
                                onMouseEnter={() => setHoveredButton(`edit-${club.id}`)}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => handleEdit(club.id)}
                                title="Modifier"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="icon-button"
                                onMouseEnter={() => setHoveredButton(`delete-${club.id}`)}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => handleDelete(club.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button
                                className="icon-button"
                                onMouseEnter={() => setHoveredButton(`add-${club.id}`)}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => {
                                  setEditingClub({
                                    id: null,
                                    matricule: '',
                                    nom: '',
                                    prenom: '',
                                    age: '',
                                    beneficiaire: 'Agent TT',
                                    type_club_id: null,
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

                {filteredClubs.length > itemsPerPage && (
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
                      Page {currentPage} sur {Math.ceil(filteredClubs.length / itemsPerPage)}
                    </span>
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredClubs.length / itemsPerPage)}
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

export default AdminClubs;