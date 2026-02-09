import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

const AdminCompte = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    login: '',
    motDePasse: '',
    residenceAdministrative: 'Espace TT Nabeul',
  });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [activeButton, setActiveButton] = useState('Compte');
  const [addStep, setAddStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const itemsPerPage = 5;
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const API_BASE_URL = 'http://localhost:3800';

  const residences = [
    'Espace TT Nabeul',
    'ULS Nabeul Technique',
    'SAAF',
    'SRH',
    'Direction',
  ];

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const validateMatricule = (matricule) => {
    return /^\d{4,5}$/.test(matricule);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateTelephone = (telephone) => {
    return /^\+?\d{8,15}$/.test(telephone);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) {
      toast.error('Utilisateur introuvable');
      return;
    }

    toast.info(
      <div>
        <p>Confirmez-vous la suppression de cet utilisateur ?</p>
        <p><strong>Matricule :</strong> {userToDelete.matricule}</p>
        <p><strong>Nom :</strong> {userToDelete.nom} {userToDelete.prenom}</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                  method: 'DELETE',
                });

                if (!response.ok) throw new Error('Erreur lors de la suppression');

                await fetchUsers();
                toast.success(
                  <div>
                    <p>Utilisateur supprimé avec succès :</p>
                    <p><strong>Matricule :</strong> {userToDelete.matricule}</p>
                    <p><strong>Nom :</strong> {userToDelete.nom} {userToDelete.prenom}</p>
                  </div>,
                  { autoClose: 5000 }
                );
                toast.dismiss();
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error("Une erreur est survenue lors de la suppression de l'utilisateur.");
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
            Oui, supprimer
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
            Annuler
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: 'top-center',
        style: { minWidth: '450px' },
      }
    );
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    if (!validateMatricule(editingUser.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!editingUser.nom.trim() || !editingUser.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    if (!validateEmail(editingUser.email)) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }
    if (!validateTelephone(editingUser.telephone)) {
      toast.error('Le numéro de téléphone doit contenir entre 8 et 15 chiffres.');
      return;
    }
    if (!editingUser.login.trim()) {
      toast.error('Le login ne peut pas être vide.');
      return;
    }
    if (editingUser.motDePasse && editingUser.motDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      const originalUser = users.find((u) => u.id === id);
      if (!originalUser) {
        toast.error('Utilisateur introuvable');
        return;
      }

      if (originalUser.matricule !== editingUser.matricule) {
        const response = await fetch(`${API_BASE_URL}/users?matricule=${editingUser.matricule}`);
        const existingUsers = await response.json();
        if (existingUsers.length > 0) {
          toast.error('Un utilisateur avec ce matricule existe déjà.');
          return;
        }
      }

      const userToUpdate = {
        matricule: editingUser.matricule,
        nom: editingUser.nom.trim(),
        prenom: editingUser.prenom.trim(),
        email: editingUser.email.trim(),
        telephone: editingUser.telephone.trim(),
        login: editingUser.login.trim(),
        residenceAdministrative: editingUser.residenceAdministrative,
      };
      if (editingUser.motDePasse) {
        userToUpdate.motDePasse = editingUser.motDePasse;
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      setShowEditPopup(false);
      setEditingUser(null);
      setEditStep(1);
      await fetchUsers();
      toast.success(
        <div>
          <p>Utilisateur mis à jour avec succès :</p>
          <p><strong>Matricule :</strong> {updatedUser.user?.matricule || editingUser.matricule}</p>
          <p><strong>Nom :</strong> {updatedUser.user?.nom || editingUser.nom} {updatedUser.user?.prenom || editingUser.prenom}</p>
        </div>,
        { autoClose: 5000 }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour de l'utilisateur.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateMatricule(newUser.matricule)) {
      toast.error('Le matricule doit contenir 4 ou 5 chiffres.');
      return;
    }
    if (!newUser.nom.trim() || !newUser.prenom.trim()) {
      toast.error('Le nom et le prénom ne peuvent pas être vides.');
      return;
    }
    if (!validateEmail(newUser.email)) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }
    if (!validateTelephone(newUser.telephone)) {
      toast.error('Le numéro de téléphone doit contenir entre 8 et 15 chiffres.');
      return;
    }
    if (!newUser.login.trim()) {
      toast.error('Le login ne peut pas être vide.');
      return;
    }
    if (!newUser.motDePasse || newUser.motDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      const userToAdd = {
        matricule: newUser.matricule,
        nom: newUser.nom.trim(),
        prenom: newUser.prenom.trim(),
        email: newUser.email.trim(),
        telephone: newUser.telephone.trim(),
        login: newUser.login.trim(),
        motDePasse: newUser.motDePasse,
        residenceAdministrative: newUser.residenceAdministrative,
      };

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToAdd),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout");
      }

      const addedUser = await response.json();
      setNewUser({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        motDePasse: '',
        residenceAdministrative: 'Espace TT Nabeul',
      });
      setShowAddPopup(false);
      setAddStep(1);
      await fetchUsers();
      toast.success(
        <div>
          <p>Utilisateur ajouté avec succès :</p>
          <p><strong>Matricule :</strong> {addedUser.user?.matricule || newUser.matricule}</p>
          <p><strong>Nom :</strong> {addedUser.user?.nom || newUser.nom} {addedUser.user?.prenom || newUser.prenom}</p>
        </div>,
        { autoClose: 5000 }
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'ajout de l'utilisateur.");
    }
  };

  const handleLogout = () => {
    const fullName = `${user?.nom || '[Nom]'} ${user?.prenom || '[Prénom]'}`;
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

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    return user.matricule && user.matricule.toString().startsWith(searchTerm);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchUsers();
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
            <button onClick={() => navigateTo('/admin', 'Accueil')} className={activeButton === 'Accueil' ? 'active' : ''}>
              Accueil
            </button>
            <button onClick={() => navigateTo('/admin/clubs', 'Clubs')} className={activeButton === 'Clubs' ? 'active' : ''}>
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
        {showAddPopup && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Ajouter un utilisateur</h2>
                <form onSubmit={addStep === 1 ? (e) => e.preventDefault() : handleAddUser} className="form-grid">
                  {addStep === 1 && (
                    <>
                      <div className="form-group">
                        <label>Matricule (4-5 chiffres) *</label>
                        <input
                          type="text"
                          value={newUser.matricule}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,5}$/.test(value)) {
                              setNewUser({ ...newUser, matricule: value });
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
                          value={newUser.nom}
                          onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                          required
                          placeholder="Entrez le nom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom *</label>
                        <input
                          type="text"
                          value={newUser.prenom}
                          onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                          required
                          placeholder="Entrez le prénom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                          placeholder="Entrez l'email"
                        />
                      </div>
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
                        <label>Téléphone *</label>
                        <input
                          type="text"
                          value={newUser.telephone}
                          onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })}
                          required
                          placeholder="Entrez le téléphone"
                        />
                      </div>
                      <div className="form-group">
                        <label>Login *</label>
                        <input
                          type="text"
                          value={newUser.login}
                          onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                          required
                          placeholder="Entrez le login"
                        />
                      </div>
                      <div className="form-group">
                        <label>Mot de passe *</label>
                        <div className="password-container">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newUser.motDePasse}
                            onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })}
                            required
                            placeholder="Entrez le mot de passe"
                          />
                          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </span>
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label>Résidence Administrative *</label>
                        <div className="select-container">
                          <select
                            value={newUser.residenceAdministrative}
                            onChange={(e) => setNewUser({ ...newUser, residenceAdministrative: e.target.value })}
                            required
                            className="form-select"
                          >
                            {residences.map((residence) => (
                              <option key={residence} value={residence}>
                                {residence}
                              </option>
                            ))}
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
                          Ajouter
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

        {showEditPopup && editingUser && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>Modifier l'utilisateur</h2>
                <form onSubmit={editStep === 1 ? (e) => e.preventDefault() : (e) => handleUpdate(e, editingUser.id)} className="form-grid">
                  {editStep === 1 && (
                    <>
                      <div className="form-group">
                        <label>Matricule (4-5 chiffres) *</label>
                        <input
                          type="text"
                          value={editingUser.matricule}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d{0,5}$/.test(value)) {
                              setEditingUser({ ...editingUser, matricule: value });
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
                          value={editingUser.nom}
                          onChange={(e) => setEditingUser({ ...editingUser, nom: e.target.value })}
                          required
                          placeholder="Entrez le nom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom *</label>
                        <input
                          type="text"
                          value={editingUser.prenom}
                          onChange={(e) => setEditingUser({ ...editingUser, prenom: e.target.value })}
                          required
                          placeholder="Entrez le prénom"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          required
                          placeholder="Entrez l'email"
                        />
                      </div>
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
                        <label>Téléphone *</label>
                        <input
                          type="text"
                          value={editingUser.telephone}
                          onChange={(e) => setEditingUser({ ...editingUser, telephone: e.target.value })}
                          required
                          placeholder="Entrez le téléphone"
                        />
                      </div>
                      <div className="form-group">
                        <label>Login *</label>
                        <input
                          type="text"
                          value={editingUser.login}
                          onChange={(e) => setEditingUser({ ...editingUser, login: e.target.value })}
                          required
                          placeholder="Entrez le login"
                        />
                      </div>
                      <div className="form-group">
                        <label>Mot de passe (optionnel)</label>
                        <div className="password-container">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={editingUser.motDePasse || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, motDePasse: e.target.value })}
                            placeholder="Entrez un nouveau mot de passe"
                          />
                          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </span>
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label>Résidence Administrative *</label>
                        <div className="select-container">
                          <select
                            value={editingUser.residenceAdministrative || 'Espace TT Nabeul'}
                            onChange={(e) => setEditingUser({ ...editingUser, residenceAdministrative: e.target.value })}
                            required
                            className="form-select"
                          >
                            {residences.map((residence) => (
                              <option key={residence} value={residence}>
                                {residence}
                              </option>
                            ))}
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
            <h2>Liste des agents TT ayant créé un compte dans l'application :</h2>
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
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Login</th>
                      <th>Résidence Administrative</th>
                      <th>Date d'inscription</th>
                      <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                          <p>Aucun utilisateur trouvé.</p>
                          <button
                            className="icon-button add-alone"
                            onClick={() => {
                              setNewUser({
                                matricule: '',
                                nom: '',
                                prenom: '',
                                email: '',
                                telephone: '',
                                login: '',
                                motDePasse: '',
                                residenceAdministrative: 'Espace TT Nabeul',
                              });
                              setShowAddPopup(true);
                              setAddStep(1);
                            }}
                            title="Ajouter un utilisateur"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.matricule || 'N/A'}</td>
                          <td>{user.nom || 'N/A'}</td>
                          <td>{user.prenom || 'N/A'}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.telephone || 'N/A'}</td>
                          <td>{user.login || 'N/A'}</td>
                          <td>{user.residenceAdministrative || 'N/A'}</td>
                          <td>
                            {user.date_inscription
                              ? new Date(user.date_inscription).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td style={{ width: '180px', textAlign: 'center' }}>
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
                                onClick={() => {
                                  setEditingUser({ ...user, motDePasse: '' });
                                  setShowEditPopup(true);
                                  setEditStep(1);
                                }}
                                title="Modifier"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => handleDelete(user.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <button
                                className="icon-button"
                                onClick={() => {
                                  setNewUser({
                                    matricule: '',
                                    nom: '',
                                    prenom: '',
                                    email: '',
                                    telephone: '',
                                    login: '',
                                    motDePasse: '',
                                    residenceAdministrative: 'Espace TT Nabeul',
                                  });
                                  setShowAddPopup(true);
                                  setAddStep(1);
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

                {filteredUsers.length > itemsPerPage && (
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
                      Page {currentPage} sur {Math.ceil(filteredUsers.length / itemsPerPage)}
                    </span>
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
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

export default AdminCompte;