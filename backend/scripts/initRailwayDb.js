const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const initializeDatabase = async () => {
  let connection;

  try {
    console.log('Connecting to Railway MySQL...');

    // Parse DATABASE_URL if provided
    let dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT) || 3306,
      multipleStatements: true
    };

    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        port: parseInt(url.port) || 3306,
        multipleStatements: true
      };
    }

    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Create database if it doesn't exist (Railway database is called 'railway')
    const dbName = process.env.DB_NAME || 'railway';
    console.log(`Using database: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    console.log('Creating tables...');

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type ENUM('patient', 'researcher', 'health_expert') NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_user_type (user_type)
      )
    `);
    console.log('✓ Users table created');

    // Patient Profiles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS PatientProfiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        \`condition\` VARCHAR(255),
        additional_conditions JSON,
        location VARCHAR(255),
        country VARCHAR(100),
        age INT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_condition (\`condition\`),
        INDEX idx_country (country)
      )
    `);
    console.log('✓ PatientProfiles table created');

    // Researcher Profiles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ResearcherProfiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        specialties JSON,
        research_interests JSON,
        institution VARCHAR(255),
        orcid VARCHAR(100),
        researchgate VARCHAR(255),
        google_scholar VARCHAR(255),
        availability ENUM('available', 'limited', 'unavailable') DEFAULT 'available',
        bio TEXT,
        years_experience INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_availability (availability)
      )
    `);
    console.log('✓ ResearcherProfiles table created');

    // Clinical Trials Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ClinicalTrials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nct_id VARCHAR(50) UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        phase VARCHAR(50),
        status VARCHAR(100),
        location VARCHAR(255),
        country VARCHAR(100),
        eligibility TEXT,
        conditions JSON,
        intervention VARCHAR(255),
        sponsor VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        study_url VARCHAR(500),
        enrollment_count INT,
        start_date DATE,
        completion_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_phase (phase),
        INDEX idx_country (country)
      )
    `);
    console.log('✓ ClinicalTrials table created');

    // Publications Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Publications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) NOT NULL,
        authors TEXT,
        journal VARCHAR(255),
        year INT,
        pubmed_id VARCHAR(50) UNIQUE,
        doi VARCHAR(255),
        summary TEXT,
        keywords JSON,
        citation_count INT DEFAULT 0,
        url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pubmed (pubmed_id),
        INDEX idx_year (year)
      )
    `);
    console.log('✓ Publications table created');

    // Favorites Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        item_type ENUM('trial', 'publication', 'researcher', 'expert') NOT NULL,
        item_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (user_id, item_type, item_id),
        INDEX idx_user_item (user_id, item_type)
      )
    `);
    console.log('✓ Favorites table created');

    // Forums Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Forums (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_by INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        post_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      )
    `);
    console.log('✓ Forums table created');

    // Forum Posts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ForumPosts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        forum_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        reply_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (forum_id) REFERENCES Forums(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_forum (forum_id),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✓ ForumPosts table created');

    // Forum Replies Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ForumReplies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES ForumPosts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_post (post_id),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✓ ForumReplies table created');

    // Meeting Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS MeetingRequests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requester_id INT NOT NULL,
        expert_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'declined', 'completed') DEFAULT 'pending',
        message TEXT,
        preferred_date DATETIME,
        meeting_link VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (expert_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_requester (requester_id),
        INDEX idx_expert (expert_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✓ MeetingRequests table created');

    // Collaborations Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Collaborations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        researcher1_id INT NOT NULL,
        researcher2_id INT NOT NULL,
        status ENUM('pending', 'active', 'completed', 'declined') DEFAULT 'pending',
        project_title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (researcher1_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (researcher2_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_researcher1 (researcher1_id),
        INDEX idx_researcher2 (researcher2_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_collaboration (researcher1_id, researcher2_id)
      )
    `);
    console.log('✓ Collaborations table created');

    // Messages Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        subject VARCHAR(255),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE,
        INDEX idx_receiver (receiver_id),
        INDEX idx_read (is_read)
      )
    `);
    console.log('✓ Messages table created');

    console.log('\n✅ All tables created successfully!');
    console.log('\nYou can now start using your application.');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
};

// Run the initialization
initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
