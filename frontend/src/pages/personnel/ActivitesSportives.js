import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ActivitesSportives.css';

const ActivitesSportives = () => {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    matricule: user?.matricule || '',
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    beneficiaire: 'Agent TT',
    age: '',
    type_activite_id: '',
  });

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

  const [typesActivite, setTypesActivite] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const fetchTypesActivite = async () => {
    try {
      const response = await fetch('http://localhost:3800/type-activite-sportive');
      if (!response.ok) throw new Error("Erreur lors de la récupération des types d'activités");
      const data = await response.json();
      setTypesActivite(data);
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          type_activite_id: data[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la récupération des types d'activités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypesActivite();
  }, []);

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

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
      const token = localStorage.getItem('token');
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

  const checkExistingRegistration = async (type_activite_id, beneficiaire, age) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3800/activites-sportives?matricule=${user.matricule}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const registrations = response.data;

      // Vérifier si une inscription existe pour le même type d'activité et le même bénéficiaire
      return registrations.some((registration) => {
        if (registration.type_activite_id !== parseInt(type_activite_id)) return false;
        if (registration.beneficiaire !== beneficiaire) return false;
        // Si bénéficiaire est 'enfant', vérifier aussi l'âge
        if (beneficiaire === 'enfant' && registration.age !== parseInt(age)) return false;
        return true;
      });
    } catch (error) {
      console.error('Erreur lors de la vérification des inscriptions existantes:', error);
      toast.error('Erreur lors de la vérification des inscriptions existantes.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Vérifier si l'utilisateur est déjà inscrit à ce type d'activité pour le même bénéficiaire
      const isAlreadyRegistered = await checkExistingRegistration(
        formData.type_activite_id,
        formData.beneficiaire,
        formData.age
      );
      if (isAlreadyRegistered) {
        toast.error(`Vous êtes déjà inscrit à cette activité sportive`);
        setSubmitting(false);
        return;
      }

      const payload = {
        matricule: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        beneficiaire: formData.beneficiaire,
        ...(formData.beneficiaire === 'enfant' && { age: parseInt(formData.age) }),
        type_activite_id: formData.type_activite_id ? parseInt(formData.type_activite_id) : undefined,
      };

      const response = await fetch('http://localhost:3800/activites-sportives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      toast.success("Inscription à l'activité sportive réussie !");
      setFormData((prev) => ({
        ...prev,
        beneficiaire: 'Agent TT',
        age: '',
        type_activite_id: typesActivite[0]?.id.toString() || '',
      }));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="activites-sportives">
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
                        <div className="input">
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

      <main className="activites-content">
        <div className="content-container">
          <div className="image-section">
            <div className="image-container">
              <img src="/images/tennis.jpg" alt="Activité sportive 1" className="content-image" />
            </div>
            <div className="image-container">
              <img src="/images/football.jpg" alt="Activité sportive 2" className="content-image" />
            </div>
            <div className="image-container">
              <img src="/images/muscullation.jpg" alt="Activité sportive 3" className="content-image" />
            </div>
          </div>

          <div className="form-section">
            <form className="content-form" onSubmit={handleSubmit}>
              <h2>Inscription aux activités sportives</h2>

              <div className="form-group">
                <label htmlFor="matricule">Matricule</label>
                <input
                  type="text"
                  id="matricule"
                  className="form-control"
                  value={formData.matricule}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text"
                  id="nom"
                  className="form-control"
                  value={formData.nom}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  className="form-control"
                  value={formData.prenom}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="beneficiaire">Bénéficiaire</label>
                <select
                  id="beneficiaire"
                  className="form-control"
                  value={formData.beneficiaire}
                  onChange={handleChange}
                  required
                >
                  <option value="Agent TT">Agent TT</option>
                  <option value="enfant">Enfant</option>
                </select>
              </div>

              {formData.beneficiaire === 'enfant' && (
                <div className="form-group">
                  <label htmlFor="age">Âge</label>
                  <input
                    type="number"
                    id="age"
                    className="form-control"
                    placeholder="Entrez l'âge de l'enfant"
                    value={formData.age}
                    onChange={handleChange}
                    min="3"
                    max="17"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="type_activite_id">Type d'activité</label>
                <select
                  id="type_activite_id"
                  className="form-control"
                  value={formData.type_activite_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {loading ? (
                    <option>Chargement...</option>
                  ) : (
                    <>
                      {typesActivite.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.nom}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || submitting}>
                {submitting ? 'Envoi en cours...' : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>

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
                Tunisie Telecom (TT) est votre partenaire pour des services de télécommunication et des activités socio-culturelles enrichissantes.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Tunisie Telecom. Tous droits réservés.</p>
          </div>
        </footer>
      </main>

      <ToastContainer />
    </div>
  );
};

export default ActivitesSportives;