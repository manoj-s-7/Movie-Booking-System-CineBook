-- Run this SQL in your MySQL workbench or CLI: mysql -u root -p3008 < init.sql

CREATE DATABASE IF NOT EXISTS cinebook;
USE cinebook;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tmdb_id INT UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  release_date DATE,
  genre_ids JSON,
  vote_average DECIMAL(3,1),
  runtime INT,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS theaters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255),
  total_seats INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS showtimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  theater_id INT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price DECIMAL(8,2) DEFAULT 250.00,
  available_seats INT DEFAULT 100,
  format ENUM('2D','3D','IMAX','4DX') DEFAULT '2D',
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  showtime_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_type ENUM('standard','premium','recliner') DEFAULT 'standard',
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  showtime_id INT NOT NULL,
  seats JSON NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  status ENUM('confirmed','cancelled','pending') DEFAULT 'confirmed',
  payment_method VARCHAR(50) DEFAULT 'card',
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

-- Seed theaters
INSERT IGNORE INTO theaters (name, location, total_seats) VALUES
('PVR Cinemas - Indiranagar', 'Indiranagar, Bangalore', 120),
('INOX - Garuda Mall', 'Magrath Road, Bangalore', 150),
('Cinepolis - Orion Mall', 'Rajajinagar, Bangalore', 100),
('PVR - Phoenix Mall', 'Whitefield, Bangalore', 130),
('Multiplex One - Koramangala', 'Koramangala, Bangalore', 110);
