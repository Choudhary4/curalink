const { promisePool } = require('../config/database');

async function cleanSelfCollaboration() {
  try {
    console.log('=== Cleaning Self-Collaboration Records ===\n');

    // Delete collaborations where researcher1_id = researcher2_id
    const [result] = await promisePool.query(`
      DELETE FROM Collaborations
      WHERE researcher1_id = researcher2_id
    `);

    console.log(`Deleted ${result.affectedRows} self-collaboration record(s).`);

    // Show remaining collaborations
    const [remaining] = await promisePool.query(`
      SELECT c.*,
             u1.name as researcher1_name,
             u2.name as researcher2_name
      FROM Collaborations c
      JOIN Users u1 ON c.researcher1_id = u1.id
      JOIN Users u2 ON c.researcher2_id = u2.id
      ORDER BY c.created_at DESC
    `);

    console.log(`\nRemaining Collaborations: ${remaining.length}\n`);
    remaining.forEach(collab => {
      console.log(`ID: ${collab.id}`);
      console.log(`  ${collab.researcher1_name} (ID: ${collab.researcher1_id}) → ${collab.researcher2_name} (ID: ${collab.researcher2_id})`);
      console.log(`  Status: ${collab.status}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanSelfCollaboration();
