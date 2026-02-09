// frontend/src/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

const Login = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        

        const loginUrl = 'http://localhost:3800/auth/login';
        console.log('Préparation de la requête vers:', loginUrl);
        console.log('Données envoyées:', { login, password });

        try {
            const response = await axios.post(loginUrl, {
                login,
                password,
            });

            console.log('Réponse complète reçue de /auth/login:', JSON.stringify(response.data, null, 2));

            if (response.data.access_token && response.data.user) {
                const user = response.data.user;
                // Vérifier les champs attendus
                const expectedFields = ['id', 'matricule', 'nom', 'prenom', 'email', 'telephone', 'residenceAdministrative', 'date_inscription', 'isAdmin'];
                const missingFields = expectedFields.filter(field => user[field] === undefined || user[field] === null);
                if (missingFields.length > 0) {
                    console.warn('Champs manquants dans les données utilisateur:', missingFields);
                    console.log('Données utilisateur reçues:', JSON.stringify(user, null, 2));
                    // Ne pas bloquer la connexion pour tester
                    // setError('Données utilisateur incomplètes reçues du serveur');
                    // toast.error('Données utilisateur incomplètes, veuillez réessayer.');
                    // return;
                } else {
                    console.log('Tous les champs requis sont présents');
                }

                console.log('Stockage du token:', response.data.access_token);
                console.log('Stockage des données utilisateur:', JSON.stringify(user, null, 2));
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(user));
                console.log('Redirection vers:', response.data.redirectTo || '/personnel');
                navigate(response.data.redirectTo || '/personnel');
                toast.success('Connexion réussie !');
            } else {
                console.warn('Réponse invalide: manque access_token ou user');
                setError('Réponse inattendue du serveur');
                toast.error('Réponse inattendue du serveur');
            }
        } catch (err) {
            console.error('Erreur lors de la connexion:', {
                message: err.message,
                response: err.response ? {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers,
                } : null,
                request: err.request ? 'Requête envoyée mais pas de réponse' : null,
            });
            if (err.response) {
                setError(err.response.data.message || 'Identifiants incorrects');
                toast.error(err.response.data.message || 'Identifiants incorrects');
            } else if (err.request) {
                setError('Impossible de se connecter au serveur');
                toast.error('Impossible de se connecter au serveur');
            } else {
                setError('Une erreur s\'est produite');
                toast.error('Une erreur s\'est produite');
            }
        }
    };

    return (
        <div className="app-container">
            <div className="auth-section">
                <h1>LOGIN</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                    <div className="password-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>
                    <button type="submit">Connexion</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <p className="switch-text">
                    Pas de compte ?
                    <span onClick={() => navigate('/register')}>
                        Créer un compte
                    </span>
                </p>
            </div>
            <div className="image-section">
                <img src="/telecome.jpg" alt="Arrière-plan" />
            </div>
        </div>
    );
};

export default Login;