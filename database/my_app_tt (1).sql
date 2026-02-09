-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 09 fév. 2026 à 13:41
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `my_app_tt`
--

-- --------------------------------------------------------

--
-- Structure de la table `activites_sportives`
--

CREATE TABLE `activites_sportives` (
  `matricule` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `date_inscription` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `type_activite_id` int(11) DEFAULT NULL,
  `beneficiaire` varchar(255) NOT NULL,
  `original_type_activite_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `activites_sportives`
--

INSERT INTO `activites_sportives` (`matricule`, `nom`, `prenom`, `age`, `id`, `date_inscription`, `type_activite_id`, `beneficiaire`, `original_type_activite_id`) VALUES
('00000', 'mahmoud', 'falfel', NULL, 188, '2025-06-18 10:28:38.188000', NULL, 'Agent TT', 118);

-- --------------------------------------------------------

--
-- Structure de la table `archived_club_types`
--

CREATE TABLE `archived_club_types` (
  `type_id` int(11) NOT NULL,
  `deleted_by` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `archived_at` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `archived_club_types`
--

INSERT INTO `archived_club_types` (`type_id`, `deleted_by`, `id`, `name`, `archived_at`) VALUES
(114, NULL, 95, 'Club de chant', '2025-06-12 00:29:31.152902'),
(115, NULL, 96, 'Club de dance', '2025-06-12 00:29:33.652837'),
(117, NULL, 97, 'Club de chant', '2025-06-12 01:17:17.094206'),
(118, NULL, 98, 'Club de dance', '2025-06-13 18:56:52.616029'),
(116, NULL, 99, 'Club de théatre', '2025-06-18 13:19:56.643025'),
(119, NULL, 100, 'Club de chan', '2025-06-19 23:43:48.736191'),
(120, NULL, 101, 'club de peintur', '2025-06-20 00:24:05.087855');

-- --------------------------------------------------------

--
-- Structure de la table `archived_sport_activity_types`
--

CREATE TABLE `archived_sport_activity_types` (
  `id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `deleted_by` varchar(255) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `archived_sport_activity_types`
--

INSERT INTO `archived_sport_activity_types` (`id`, `type_id`, `deleted_by`, `nom`, `archived_at`) VALUES
(171, 118, 'system', 'football', '2025-06-18 11:10:15');

-- --------------------------------------------------------

--
-- Structure de la table `club`
--

CREATE TABLE `club` (
  `matricule` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `date_inscription` timestamp NOT NULL DEFAULT current_timestamp(),
  `type_club_id` int(11) DEFAULT NULL,
  `beneficiaire` varchar(255) NOT NULL,
  `original_type_club_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `club`
--

INSERT INTO `club` (`matricule`, `nom`, `prenom`, `age`, `id`, `date_inscription`, `type_club_id`, `beneficiaire`, `original_type_club_id`) VALUES
('66666', 'Dupont', 'mahmoud', NULL, 215, '2026-02-08 18:48:48', 122, 'Agent TT', 122);

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` int(11) NOT NULL,
  `eventName` varchar(255) NOT NULL,
  `eventDate` varchar(255) NOT NULL,
  `startTime` varchar(255) NOT NULL,
  `eventLocation` varchar(255) NOT NULL,
  `ticketNumber` int(11) NOT NULL,
  `ticketPrice` decimal(10,2) NOT NULL,
  `eventImage` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `evenement`
--

INSERT INTO `evenement` (`id`, `eventName`, `eventDate`, `startTime`, `eventLocation`, `ticketNumber`, `ticketPrice`, `eventImage`) VALUES
(94, 'Séminaire', '2025-06-19', '21:00', 'Tunisie Télécom, Rue de la Révolution, Médina, El Asouak, Délégation Nabeul, Gouvernorat Nabeul, 8000, Tunisie', 50, 20.00, 'Uploads\\eventImage-1750202993809-385662634.jpeg'),
(95, 'carthage land', '2025-06-20', '07:48', 'Carthage Land, Route Nationale Tunis - Ras Jedir, Yasmine Hammamet, Manaret El Hammamet, Délégation Hammamet, Gouvernorat Nabeul, 8052, Tunisie', 3, 20.00, 'Uploads\\eventImage-1750370389450-746282154.jpeg'),
(96, 'Hotel', '2025-06-17', '09:00', 'La Playa Hôtel Club, Rue de la Paix, Hammamet, Jinene Hammamet, Mnaret El Hammamet, Manaret El Hammamet, Délégation Hammamet, Gouvernorat Nabeul, 8042, Tunisie', 100, 20.00, 'Uploads\\eventImage-1750200801679-75099528.avif'),
(98, 'conférance de press', '2026-02-08', '21:01', 'Marché Sidi El Bahri, Rue Bab El Khadra, Sidi El Bahri, Délégation Bab Bhar, Tunis, Gouvernorat Tunis, 1005, Tunisie', 100, 20.00, 'Uploads\\eventImage-1770577596991-314427818.jpg');

-- --------------------------------------------------------

--
-- Structure de la table `inscription_evenement`
--

CREATE TABLE `inscription_evenement` (
  `id` int(11) NOT NULL,
  `matricule` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `payment` varchar(50) NOT NULL,
  `eventname` varchar(255) NOT NULL,
  `date_inscription` timestamp NOT NULL DEFAULT current_timestamp(),
  `beneficiaire` varchar(50) NOT NULL,
  `eventStatus` varchar(50) NOT NULL DEFAULT 'En cours',
  `numberOfTickets` int(11) NOT NULL,
  `totalAmount` float NOT NULL,
  `eventId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `inscription_evenement`
--

INSERT INTO `inscription_evenement` (`id`, `matricule`, `nom`, `prenom`, `age`, `payment`, `eventname`, `date_inscription`, `beneficiaire`, `eventStatus`, `numberOfTickets`, `totalAmount`, `eventId`, `userId`) VALUES
(141, '66666', 'Dupont', 'mahmoud', NULL, 'creditCard', 'conférance de press', '2026-02-08 19:04:15', 'Agent TT', 'En cours', 1, 20, 98, 88);

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `matricule` varchar(255) NOT NULL,
  `rating` int(1) NOT NULL,
  `comment` text NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `eventId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `sentiment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sentiment`)),
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `reviews`
--

INSERT INTO `reviews` (`id`, `matricule`, `rating`, `comment`, `createdAt`, `eventId`, `userId`, `sentiment`, `nom`, `prenom`) VALUES
(136, '66666', 5, 'bravo', '2026-02-08 20:07:13.622000', 98, 88, '{\"label\":\"POSITIVE\",\"score\":0.6796488165855408,\"stars\":5}', 'Dupont', 'mahmoud');

-- --------------------------------------------------------

--
-- Structure de la table `type_activite_sportive`
--

CREATE TABLE `type_activite_sportive` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'en cours'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `type_activite_sportive`
--

INSERT INTO `type_activite_sportive` (`id`, `nom`, `status`) VALUES
(116, 'tennis', 'en cours'),
(117, 'basketball', 'en cours');

-- --------------------------------------------------------

--
-- Structure de la table `type_club`
--

CREATE TABLE `type_club` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'en cours'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `type_club`
--

INSERT INTO `type_club` (`id`, `name`, `status`) VALUES
(121, 'club de théatre', 'en cours'),
(122, 'club de chant', 'en cours');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(255) NOT NULL,
  `login` varchar(255) NOT NULL,
  `motDePasse` varchar(255) NOT NULL,
  `date_inscription` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `residenceAdministrative` enum('Espace TT Nabeul','ULS Nabeul Technique','SAAF','SRH','Direction') NOT NULL DEFAULT 'Espace TT Nabeul',
  `matricule` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `nom`, `prenom`, `email`, `telephone`, `login`, `motDePasse`, `date_inscription`, `residenceAdministrative`, `matricule`) VALUES
(88, 'Dupont', 'mahmoud', 'mahhmahh73@gmail.com', '52791534', 'mahmoud', '$2b$10$9c1qz7SB9YzKk/aCN3BNkuThHbW40hTvAMnkDUxLB10m0nc5itTgW', '2026-02-08 18:47:54.910000', 'SRH', '66666');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `activites_sportives`
--
ALTER TABLE `activites_sportives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_ae50f4820692619169331424607` (`type_activite_id`);

--
-- Index pour la table `archived_club_types`
--
ALTER TABLE `archived_club_types`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `archived_sport_activity_types`
--
ALTER TABLE `archived_sport_activity_types`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `club`
--
ALTER TABLE `club`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_d931224a1fe1713e640ad2f7a20` (`type_club_id`);

--
-- Index pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `inscription_evenement`
--
ALTER TABLE `inscription_evenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_0efbfee92d0d947285db126a71d` (`eventId`),
  ADD KEY `FK_c77f695882bae13fe30a3d96fd5` (`userId`);

--
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_4f7296a2fca003e6422701be16c` (`eventId`),
  ADD KEY `FK_7ed5659e7139fc8bc039198cc1f` (`userId`);

--
-- Index pour la table `type_activite_sportive`
--
ALTER TABLE `type_activite_sportive`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `type_club`
--
ALTER TABLE `type_club`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_259473ab221f66ce5b7842195f` (`matricule`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `activites_sportives`
--
ALTER TABLE `activites_sportives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT pour la table `archived_club_types`
--
ALTER TABLE `archived_club_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT pour la table `archived_sport_activity_types`
--
ALTER TABLE `archived_sport_activity_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=172;

--
-- AUTO_INCREMENT pour la table `club`
--
ALTER TABLE `club`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- AUTO_INCREMENT pour la table `evenement`
--
ALTER TABLE `evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT pour la table `inscription_evenement`
--
ALTER TABLE `inscription_evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT pour la table `type_activite_sportive`
--
ALTER TABLE `type_activite_sportive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT pour la table `type_club`
--
ALTER TABLE `type_club`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activites_sportives`
--
ALTER TABLE `activites_sportives`
  ADD CONSTRAINT `FK_ae50f4820692619169331424607` FOREIGN KEY (`type_activite_id`) REFERENCES `type_activite_sportive` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Contraintes pour la table `club`
--
ALTER TABLE `club`
  ADD CONSTRAINT `FK_d931224a1fe1713e640ad2f7a20` FOREIGN KEY (`type_club_id`) REFERENCES `type_club` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `inscription_evenement`
--
ALTER TABLE `inscription_evenement`
  ADD CONSTRAINT `FK_0efbfee92d0d947285db126a71d` FOREIGN KEY (`eventId`) REFERENCES `evenement` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_c77f695882bae13fe30a3d96fd5` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FK_4f7296a2fca003e6422701be16c` FOREIGN KEY (`eventId`) REFERENCES `evenement` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_7ed5659e7139fc8bc039198cc1f` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
