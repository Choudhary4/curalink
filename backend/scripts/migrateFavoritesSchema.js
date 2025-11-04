const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigration = async () => {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'curalink'
    });

    console.log('Connected successfully!');
    console.log('\nStarting migration: Fix Favorites table to support string IDs...\n');

    // Drop the existing unique constraint
    console.log('1. Dropping existing unique constraint...');
    try {
      await connection.query('ALTER TABLE Favorites DROP INDEX unique_favorite');
      console.log('   ✓ Unique constraint dropped');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('   ℹ Constraint already dropped or does not exist');
      } else {
        throw error;
      }
    }

    // Modify item_id column from INT to VARCHAR
    console.log('2. Modifying item_id column from INT to VARCHAR(100)...');
    await connection.query('ALTER TABLE Favorites MODIFY item_id VARCHAR(100) NOT NULL');
    console.log('   ✓ Column modified successfully');

    // Recreate the unique constraint
    console.log('3. Recreating unique constraint...');
    await connection.query('ALTER TABLE Favorites ADD UNIQUE KEY unique_favorite (user_id, item_type, item_id)');
    console.log('   ✓ Unique constraint recreated');

    // Verify the change
    console.log('\n4. Verifying schema changes...');
    const [rows] = await connection.query('DESCRIBE Favorites');
    console.log('\nFavorites table schema:');
    console.table(rows);

    console.log('\n✅ Migration completed successfully!');
    console.log('The Favorites table now supports string IDs (NCT IDs, PubMed IDs, ORCID IDs)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
};

runMigration();
