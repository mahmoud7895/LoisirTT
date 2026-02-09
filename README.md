# LoisirTT - Application Web Intelligente 🇹🇳

## 📌 Présentation du Projet
Ce projet est réalisé dans le cadre d'un **Stage de Fin d'Études (PFE)** au sein de **Tunisie Télécom**. 
**LoisirTT** est une plateforme dédiée à la gestion automatisée des activités socio-culturelles (clubs, sports, événements) pour les employés de l'entreprise.

### Points forts :
- **Analyse de Sentiment :** Utilisation de l'IA pour analyser les avis des agents.
- **Tableau de Bord :** Statistiques en temps réel pour les administrateurs.
- **Architecture :** Respect du pattern MVC pour une maintenance évolutive.

---

## 🛠️ Stack Technique
* **Frontend :** React JS, Bootstrap.
* **Backend :** NestJS (Node.js), TypeScript.
* **Base de Données :** MySQL (TypeORM).
* **Outils :** Git, Postman, XAMPP.

---

## ⚙️ Installation et Configuration

### 1. Base de données
- Importer le fichier `database/loisir_tt.sql` dans votre serveur MySQL.

### 2. Backend (NestJS)
```bash
cd backend
npm install
# Créez un fichier .env avec vos accès MySQL
npm run start:dev
L'application intègre un module d'IA pour traiter les avis laissés par les employés de Tunisie Télécom après chaque événement.

### Fonctionnement :
1. **Collecte :** Les commentaires sont récupérés via l'API NestJS.
2. **Traitement :** Le `sentiment_service` analyse le texte (NLP - Natural Language Processing).
3. **Score :** L'IA attribue une note (Positif, Neutre, Négatif).
4. **Visualisation :** Les résultats sont affichés sous forme de graphiques dans le Dashboard Admin.
python sentiment_analysis.py