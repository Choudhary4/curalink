const { promisePool } = require('../config/database');

async function checkCollaborations() {
  try {
    console.log('=== Checking Collaborations Table ===\n');

    // Check all collaborations
    const [collaborations] = await promisePool.query(`
      SELECT c.*,
             u1.name as researcher1_name, u1.email as researcher1_email,
             u2.name as researcher2_name, u2.email as researcher2_email
      FROM Collaborations c
      JOIN Users u1 ON c.researcher1_id = u1.id
      JOIN Users u2 ON c.researcher2_id = u2.id
      ORDER BY c.created_at DESC
    `);

    console.log(`Total Collaborations: ${collaborations.length}\n`);

    if (collaborations.length > 0) {
      collaborations.forEach(collab => {
        console.log(`ID: ${collab.id}`);
        console.log(`  Researcher 1: ${collab.researcher1_name} (ID: ${collab.researcher1_id}, Email: ${collab.researcher1_email})`);
        console.log(`  Researcher 2: ${collab.researcher2_name} (ID: ${collab.researcher2_id}, Email: ${collab.researcher2_email})`);
        console.log(`  Status: ${collab.status}`);
        console.log(`  Project: ${collab.project_title || 'N/A'}`);
        console.log(`  Created: ${collab.created_at}`);
        console.log('---');
      });
    } else {
      console.log('No collaborations found in database.');
    }

    // Check all researchers
    console.log('\n=== Checking All Researchers ===\n');
    const [researchers] = await promisePool.query(`
      SELECT u.id, u.name, u.email, u.user_type
      FROM Users u
      WHERE u.user_type = 'researcher'
      ORDER BY u.id
    `);

    console.log(`Total Researchers: ${researchers.length}\n`);
    researchers.forEach(r => {
      console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCollaborations();
