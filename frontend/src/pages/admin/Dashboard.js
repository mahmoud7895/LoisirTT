import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Doughnut, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminActivitesSportives.css';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('Dashboard');
  const [stats, setStats] = useState({
    inscriptionsByActiveClubType: [],
    inscriptionsByArchivedClubType: [],
    inscriptionsByActiveSportType: [],
    inscriptionsByArchivedSportType: [],
    inscriptionsByBeneficiaryClub: [],
    inscriptionsByBeneficiarySport: [],
    reviewsByEvent: [],
  });

  const chartRefs = useRef({
    clubType: null,
    sportType: null,
    beneficiaryClub: null,
    beneficiarySport: null,
    reviewsByEvent: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Accès non autorisé');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const socket = io('http://localhost:3800', {
      auth: { token: localStorage.getItem('token') },
    });

    socket.on('connect', () => {
      console.log('Connecté au WebSocket');
      socket.emit('subscribeToDashboard');
    });

    socket.on('dashboardData', (data) => {
      if (data && typeof data === 'object') {
        console.log('Données reçues du WebSocket:', JSON.stringify(data, null, 2));
        const validatedReviewsByEvent = (data.reviewsByEvent || []).map(event => ({
          eventName: event.eventName || 'Événement inconnu',
          positive: Number(event.positive) || 0,
          neutral: Number(event.neutral) || 0,
          negative: Number(event.negative) || 0,
        }));
        setStats({
          inscriptionsByActiveClubType: data.inscriptionsByActiveClubType || [],
          inscriptionsByArchivedClubType: data.inscriptionsByArchivedClubType || [],
          inscriptionsByActiveSportType: data.inscriptionsByActiveSportType || [],
          inscriptionsByArchivedSportType: data.inscriptionsByArchivedSportType || [],
          inscriptionsByBeneficiaryClub: data.inscriptionsByBeneficiaryClub || [],
          inscriptionsByBeneficiarySport: data.inscriptionsByBeneficiarySport || [],
          reviewsByEvent: validatedReviewsByEvent,
        });
        console.log('Stats reviewsByEvent après mise à jour:', JSON.stringify(validatedReviewsByEvent, null, 2));
      }
    });

    socket.on('error', (error) => {
      toast.error(`Erreur WebSocket: ${error.message || 'Connexion échouée'}`);
    });

    socket.on('connect_error', (error) => {
      toast.error('Impossible de se connecter au serveur de données en temps réel.');
    });

    return () => socket.disconnect();
  }, []);

  const destroyChart = (chartKey) => {
    if (chartRefs.current[chartKey]) {
      chartRefs.current[chartKey].destroy();
      chartRefs.current[chartKey] = null;
    }
  };

  const navigateTo = (path, buttonName) => {
    navigate(path);
    setActiveButton(buttonName);
  };

  const handleLogout = () => {
    toast.info(
      <div className="logout-confirmation">
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="form-actions">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
              toast.dismiss();
            }}
          >
            Oui
          </button>
          <button onClick={() => toast.dismiss()}>
            Annuler
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeButton: false,
        className: 'modal-content',
      }
    );
  };

  const inscriptionsByClubTypeChartData = {
    labels: [
      ...stats.inscriptionsByActiveClubType.map(club => club.name).filter(name => name && !name.startsWith('null')),
      ...stats.inscriptionsByArchivedClubType.map(club => club.name).filter(name => name && !name.startsWith('Type non archivé')),
    ],
    datasets: [
      {
        data: [
          ...stats.inscriptionsByActiveClubType.filter(club => club.name && !club.name.startsWith('null')).map(club => club.inscriptions || 0),
          ...stats.inscriptionsByArchivedClubType.filter(club => club.name && !club.name.startsWith('Type non archivé')).map(club => club.inscriptions || 0),
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(0, 255, 255, 0.7)',
          'rgba(130, 32, 182, 0.7)',
          'rgba(24, 194, 35, 0.7)',
          'rgba(198, 16, 131, 0.72)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const inscriptionsBySportTypeChartData = {
    labels: [
      ...stats.inscriptionsByActiveSportType.map(sport => sport.name).filter(name => name && !name.startsWith('Type non spécifié')),
      ...stats.inscriptionsByArchivedSportType.map(sport => sport.name).filter(name => name && !name.startsWith('Type non spécifié')),
    ],
    datasets: [
      {
        data: [
          ...stats.inscriptionsByActiveSportType.filter(sport => sport.name && !sport.name.startsWith('Type non spécifié')).map(sport => sport.inscriptions || 0),
          ...stats.inscriptionsByArchivedSportType.filter(sport => sport.name && !sport.name.startsWith('Type non spécifié')).map(sport => sport.inscriptions || 0),
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(0, 255, 255, 0.7)',
          'rgba(128, 128, 128, 0.7)',
          'rgba(169, 169, 169, 0.7)',
          'rgba(192, 192, 192, 0.7)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const inscriptionsByBeneficiaryClubChartData = {
    labels: stats.inscriptionsByBeneficiaryClub.map(item => item.beneficiary),
    datasets: [
      {
        label: 'Nombre de inscriptions',
        data: stats.inscriptionsByBeneficiaryClub.map(item => item.inscriptions),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const inscriptionsByBeneficiarySportChartData = {
    labels: stats.inscriptionsByBeneficiarySport.map(item => item.beneficiary),
    datasets: [
      {
        label: 'Nombre de inscriptions',
        data: stats.inscriptionsByBeneficiarySport.map(item => item.inscriptions),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const reviewsByEventChartData = {
    labels: stats.reviewsByEvent.map(event => event.eventName),
    datasets: [
      {
        label: 'Avis positifs',
        data: stats.reviewsByEvent.map(event => {
          const value = event.positive || 0;
          console.log(`Avis positifs pour ${event.eventName}: ${value}`);
          return value;
        }),
        backgroundColor: 'rgba(75, 192, 75, 0.7)',
        stack: 'Stack 0',
      },
      {
        label: 'Avis neutres',
        data: stats.reviewsByEvent.map(event => {
          const value = event.neutral || 0;
          console.log(`Avis neutres pour ${event.eventName}: ${value}`);
          return value;
        }),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        stack: 'Stack 0',
      },
      {
        label: 'Avis négatifs',
        data: stats.reviewsByEvent.map(event => {
          const value = event.negative || 0;
          console.log(`Avis négatifs pour ${event.eventName}: ${value}`);
          return value;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        stack: 'Stack 0',
      },
    ],
  };
  console.log('Données du graphique avis détaillées:', JSON.stringify(reviewsByEventChartData, null, 2));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
            const currentValue = dataset.data[tooltipItem.dataIndex];
            const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(2) : 0;
            return `${dataset.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
          return `${percentage}%`;
        },
        color: '#ffffff',
        font: { size: 14, weight: 'bold' },
        textAlign: 'center',
        anchor: 'center',
        align: 'center',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { size: 14, weight: 'bold' },
        formatter: (value) => {
          return typeof value === 'number' && !isNaN(value) ? value.toFixed(0) : '0';
        },
        anchor: 'end',
        align: 'end',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bénéficiaire',
          color: '#ffffff',
          font: { size: 14 },
        },
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de inscriptions',
          color: '#ffffff',
          font: { size: 14 },
        },
        ticks: { color: '#ffffff', beginAtZero: true },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const reviewsBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#ffffff', font: { size: 14 } } },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets.reduce((sum, dataset) => sum + (dataset.data[context.dataIndex] || 0), 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: { size: 12, weight: 'bold' },
        formatter: (value, context) => {
          const total = context.chart.data.datasets.reduce((sum, dataset) => sum + (dataset.data[context.dataIndex] || 0), 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return value > 0 ? `${percentage}%` : '';
        },
        anchor: 'center',
        align: 'center',
      },
    },
    scales: {
      x: { title: { display: true, text: 'Événements', color: '#ffffff', font: { size: 14 } }, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, stacked: true },
      y: { 
        title: { display: true, text: "Nombre d'avis", color: '#ffffff', font: { size: 14 } }, 
        ticks: { color: '#ffffff', beginAtZero: true, stepSize: 1, min: 0, max: 5 }, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
        stacked: true 
      },
    },
  };

  return (
    <div className="dashboard">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

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
            <button onClick={() => navigateTo('/admin/activites-sportives', 'Activités')} className={activeButton === 'Activités' ? 'active' : ''}>
              Activités sportives
            </button>
            <button onClick={() => navigateTo('/admin/evenements', 'Événements')} className={activeButton === 'Événements' ? 'active' : ''}>
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
            <button onClick={() => navigateTo('/admin/compte', 'Compte')} className={activeButton === 'Compte' ? 'active' : ''}>
              Compte
            </button>
            <button onClick={() => navigateTo('/admin/dashboard', 'Dashboard')} className={activeButton === 'Dashboard' ? 'active' : ''}>
              Dashboard
            </button>
          </nav>
        </div>
        <button className="icon-button" onClick={handleLogout} title="Déconnexion" aria-label="Déconnexion">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </header>

      <main className="dashboard-content">
        <h1>Tableau de Bord Administrateur</h1>
        <div className="chart-grid">
          <div className="chart-container reviews-chart">
            <h2>Répartition des avis par événement</h2>
            <div className="chart-wrapper">
              {stats.reviewsByEvent?.length > 0 && reviewsByEventChartData.labels.length > 0 ? (
                <Bar
                  data={reviewsByEventChartData}
                  options={reviewsBarChartOptions}
                  height={300}
                  ref={(chart) => {
                    destroyChart('reviewsByEvent');
                    if (chart?.chartInstance) {
                      chartRefs.current.reviewsByEvent = chart.chartInstance;
                    } else {
                      console.error('Erreur de rendu du graphique:', chart);
                    }
                  }}
                />
              ) : (
                <p>Aucun avis disponible pour les événements terminés ou données invalides.</p>
              )}
            </div>
            <div className="reviews-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'rgba(75, 192, 75, 0.7)' }}></span>Avis positifs
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'rgba(255, 206, 86, 0.7)' }}></span>Avis neutres
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: 'rgba(255, 99, 132, 0.7)' }}></span>Avis négatifs
              </div>
            </div>
          </div>
          <div className="chart-container">
            <h2>Répartition des inscriptions aux clubs</h2>
            <div className="chart-wrapper">
              {inscriptionsByClubTypeChartData.labels.length > 0 ? (
                <Doughnut
                  data={inscriptionsByClubTypeChartData}
                  options={chartOptions}
                  height={300}
                  ref={(chart) => {
                    destroyChart('clubType');
                    chartRefs.current.clubType = chart?.chartInstance;
                  }}
                />
              ) : (
                <p>Aucun club disponible pour les inscriptions.</p>
              )}
            </div>
          </div>

          <div className="chart-container">
            <h2>Répartition des inscriptions aux activités sportives</h2>
            <div className="chart-wrapper">
              {inscriptionsBySportTypeChartData.labels.length > 0 ? (
                <Doughnut
                  data={inscriptionsBySportTypeChartData}
                  options={chartOptions}
                  height={300}
                  ref={(chart) => {
                    destroyChart('sportType');
                    chartRefs.current.sportType = chart?.chartInstance;
                  }}
                />
              ) : (
                <p>Aucun activité sportive disponible pour les inscriptions.</p>
              )}
            </div>
          </div>
          

          <div className="chart-container">
            <h2>Répartition des inscriptions aux clubs par bénéficiaire</h2>
            <div className="chart-wrapper">
              {inscriptionsByBeneficiaryClubChartData.labels.length > 0 ? (
                <Bar
                  data={inscriptionsByBeneficiaryClubChartData}
                  options={barChartOptions}
                  height={300}
                  ref={(chart) => {
                    destroyChart('beneficiaryClub');
                    chartRefs.current.beneficiaryClub = chart?.chartInstance;
                  }}
                />
              ) : (
                <p>Aucune inscription disponible pour les clubs.</p>
              )}
            </div>
          </div>

          <div className="chart-container">
            <h2>Répartition des inscriptions aux activités sportives par bénéficiaire</h2>
            <div className="chart-wrapper">
              {inscriptionsByBeneficiarySportChartData.labels.length > 0 ? (
                <Bar
                  data={inscriptionsByBeneficiarySportChartData}
                  options={barChartOptions}
                  height={300}
                  ref={(chart) => {
                    destroyChart('beneficiarySport');
                    chartRefs.current.beneficiarySport = chart?.chartInstance;
                  }}
                />
              ) : (
                <p>Aucune inscription disponible pour les activités sportives.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;