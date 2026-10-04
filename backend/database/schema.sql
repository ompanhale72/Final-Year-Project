CREATE DATABASE IF NOT EXISTS smart_vehicle_market;
USE smart_vehicle_market;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(80),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(160) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  predicted_price DECIMAL(12,2),
  km_driven INT NOT NULL,
  fuel_type VARCHAR(40) NOT NULL,
  transmission_type VARCHAR(40) NOT NULL,
  seller_type VARCHAR(60) DEFAULT 'Individual',
  owner_type VARCHAR(80) DEFAULT 'First Owner',
  city VARCHAR(80) NOT NULL,
  latitude DOUBLE,
  longitude DOUBLE,
  condition_rating DOUBLE DEFAULT 4,
  description TEXT,
  image_urls TEXT,
  seller_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehicle_brand (brand),
  INDEX idx_vehicle_city (city),
  CONSTRAINT fk_vehicle_seller FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  brand VARCHAR(80),
  price DECIMAL(12,2) NOT NULL,
  city VARCHAR(80) NOT NULL,
  `condition` VARCHAR(60) DEFAULT 'New',
  image_url VARCHAR(500),
  seller_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_part_name (name),
  CONSTRAINT fk_part_seller FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  vehicle_id INT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
  CONSTRAINT fk_chat_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
