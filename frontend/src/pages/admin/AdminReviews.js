// AdminReviews.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeButton, setActiveButton] = useState('Avis');
  const itemsPerPage = 5;
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const API_BASE_URL = 'http://localhost:3800';

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Session expirée, veuillez vous reconnecter');
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des avis');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la récupération des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const reviewToDelete = reviews.find((r) => r.id === id);
    if (!reviewToDelete) {
      toast.error('Avis introuvable');
      return;
    }

    toast.info(
      <div>
        <p>Confirmez-vous la suppression de cet avis ?</p>
        <p><strong>Événement :</strong> {reviewToDelete.event?.eventName || 'N/A'}</p>
        <p><strong>Utilisateur :</strong> {reviewToDelete.nom || reviewToDelete.user?.nom || 'N/A'} {reviewToDelete.prenom || reviewToDelete.user?.prenom || 'N/A'}</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  throw new Error('Session expirée, veuillez vous reconnecter');
                }

                const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.message || 'Erreur lors de la suppression');
                }

                await fetchReviews();
                toast.success(
                  <div>
                    <p>{result.message || 'Avis supprimé avec succès'}</p>
                    <p><strong>Événement :</strong> {reviewToDelete.event?.eventName || 'N/A'}</p>
                  </div>,
                  { autoClose: 5000 }
                );
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error(error.message || "Une erreur est survenue lors de la suppression de l'avis.");
              } finally {
                toast.dismiss();
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

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    return (
      (review.matricule && review.matricule.toString().includes(searchTerm)) ||
      (review.nom && review.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.prenom && review.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.event?.eventName && review.event.eventName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchReviews();
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
        <div className="search-and-table-container">
          <div className="search-bar">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Rechercher par matricule, nom, prénom ou événement"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <br />
          <div className="table-container">
            <h2>Liste des Avis sur les Événements :</h2>
            <br />
            {loading ? (
              <p className="text-center">Chargement en cours...</p>
            ) : (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Événement</th>
                      <th>Utilisateur</th>
                      <th>Matricule</th>
                      <th>Note</th>
                      <th>Commentaire</th>
                      <th>Sentiment</th>
                      <th>Date</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                          Aucun avis trouvé.
                        </td>
                      </tr>
                    ) : (
                      currentReviews.map((review) => (
                        <tr key={review.id}>
                          <td>{review.event?.eventName || 'N/A'}</td>
                          <td>{review.nom || review.user?.nom || 'Utilisateur supprimé'} {review.prenom || review.user?.prenom || ''}</td>
                          <td>{review.matricule || 'N/A'}</td>
                          <td>
                            {review.rating}
                            <i className="bi bi-star-fill text-warning ms-1"></i>
                          </td>
                          <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {review.comment || 'N/A'}
                          </td>
                          <td>
                            {review.sentiment ? (
                              <span className={`badge ${
                                review.sentiment.label === 'POSITIVE' ? 'bg-success' : 
                                review.sentiment.label === 'NEGATIVE' ? 'bg-danger' : 'bg-secondary'
                              }`}>
                                {review.sentiment.label === 'POSITIVE' ? 'Positif' : 
                                 review.sentiment.label === 'NEGATIVE' ? 'Négatif' : 'Neutre'}
                                {review.sentiment.score && ` (${Math.round(review.sentiment.score * 100)}%)`}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
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
                                onClick={() => handleDelete(review.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {filteredReviews.length > itemsPerPage && (
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
                      Page {currentPage} sur {Math.ceil(filteredReviews.length / itemsPerPage)}
                    </span>
                    <button
                      className="btn btn-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredReviews.length / itemsPerPage)}
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

export default AdminReviews;