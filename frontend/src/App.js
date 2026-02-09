import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminHome from './pages/admin/AdminHome.js';
import PersonnelHome from './pages/personnel/PersonnelHome.js';
import ActivitesSportives from './pages/personnel/ActivitesSportives.js';
import AdminActivitesSportives from './pages/admin/AdminActivitesSportives.js';
import AdminClubs from './pages/admin/AdminClubs.js';
import AdminEvenements from './pages/admin/AdminEvenements.js';
import Clubs from './pages/personnel/Clubs.js';
import Evenements from './pages/personnel/Evenements.js';
import AdminCompte from './pages/admin/AdminCompte';
import InscriptionEvenement from './pages/admin/inscription_evenement.js';
import Dashboard from './pages/admin/Dashboard.js';
import AdminReviews from './pages/admin/AdminReviews.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const NotFound = () => {
    return <div>Page non trouvée</div>;
};

function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login />} />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminHome />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/personnel"
                    element={
                        <PrivateRoute>
                            <PersonnelHome />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/personnel/activites-sportives"
                    element={
                        <PrivateRoute>
                            <ActivitesSportives />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/activites-sportives"
                    element={
                        <PrivateRoute>
                            <AdminActivitesSportives />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/personnel/clubs"
                    element={
                        <PrivateRoute>
                            <Clubs />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/clubs"
                    element={
                        <PrivateRoute>
                            <AdminClubs />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/evenements"
                    element={
                        <PrivateRoute>
                            <AdminEvenements />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/personnel/evenements"
                    element={
                        <PrivateRoute>
                            <Evenements />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/compte"
                    element={
                        <PrivateRoute>
                            <AdminCompte />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/inscription_evenement"
                    element={
                        <PrivateRoute>
                            <InscriptionEvenement />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/reviews"
                    element={
                        <PrivateRoute>
                            <AdminReviews />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;