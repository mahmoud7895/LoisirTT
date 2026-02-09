import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        login: '',
        motDePasse: '',
        residenceAdministrative: 'Espace TT Nabeul'
    });

    const residences = [
        'Espace TT Nabeul',
        'ULS Nabeul Technique',
        'SAAF',
        'SRH',
        'Direction'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3800/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Inscription réussie', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                navigate('/login');
            } else {
                console.error('Erreur lors de l\'inscription:', data.message);
                toast.error(data.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Une erreur s\'est produite. Veuillez réessayer.');
        }
    };

    return (
        <div className="app-container">
            <div className="auth-section">
                <h2>INSCRIPTION</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="matricule"
                        placeholder="Matricule (4 ou 5 chiffres)"
                        value={formData.matricule}
                        onChange={handleChange}
                        required
                        maxLength={5}
                    />
                    <input
                        type="text"
                        name="nom"
                        placeholder="Nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="prenom"
                        placeholder="Prénom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="telephone"
                        placeholder="Téléphone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="login"
                        placeholder="Login"
                        value={formData.login}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="motDePasse"
                        placeholder="Password"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="residenceAdministrative"
                        value={formData.residenceAdministrative}
                        onChange={handleChange}
                        required
                    >
                        {residences.map((residence) => (
                            <option key={residence} value={residence}>
                                {residence}
                            </option>
                        ))}
                    </select>
                    <button type="submit">S'inscrire</button>
                </form>
                <p className="switch-text">
                    Déjà un compte ? 
                    <span onClick={() => navigate('/login')}>
                        Se connecter
                    </span>
                </p>
            </div>
            <div className="image-section">
                <img src="/telecome.jpg" alt="Background" />
            </div>
        </div>
    );
};

export default Register;