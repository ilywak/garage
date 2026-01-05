-- Simple MySQL schema for Autosales Hub

CREATE TABLE IF NOT EXISTS garages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  adresse VARCHAR(255),
  telephone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','responsable','employe') NOT NULL DEFAULT 'employe',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  garage_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_profiles_garages FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS voitures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  garage_id INT,
  marque VARCHAR(100) NOT NULL,
  modele VARCHAR(100) NOT NULL,
  annee INT NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  kilometrage INT DEFAULT 0,
  carburant ENUM('essence','diesel','electrique','hybride','gpl') NOT NULL,
  etat ENUM('neuf','occasion','reconditionne') NOT NULL,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  couleur VARCHAR(50),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_voitures_disponible (disponible),
  CONSTRAINT fk_voitures_garages FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  garage_id INT NOT NULL,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clients_garage (garage_id),
  CONSTRAINT fk_clients_garages FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ventes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voiture_id INT NOT NULL,
  client_id INT NOT NULL,
  employe_id INT NOT NULL,
  garage_id INT NOT NULL,
  prix_vente DECIMAL(10,2) NOT NULL,
  date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ventes_garage (garage_id),
  INDEX idx_ventes_date (date_vente),
  CONSTRAINT fk_ventes_voitures FOREIGN KEY (voiture_id) REFERENCES voitures(id),
  CONSTRAINT fk_ventes_clients FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_ventes_employe FOREIGN KEY (employe_id) REFERENCES profiles(id),
  CONSTRAINT fk_ventes_garage FOREIGN KEY (garage_id) REFERENCES garages(id)
);
