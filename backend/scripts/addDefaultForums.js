const { promisePool } = require('../config/database');

async function addDefaultForums() {
  console.log('Adding default forum communities...');

  const defaultForums = [
    {
      name: 'Treatment & Therapies',
      description: 'Discuss treatment options, therapies, and medical approaches',
      category: 'Medical',
      created_by: 1 // Will need to be updated to a real researcher ID
    },
    {
      name: 'Clinical Trials',
      description: 'Share experiences and questions about clinical trials',
      category: 'Research',
      created_by: 1
    },
    {
      name: 'Patient Support',
      description: 'Connect with other patients for support and shared experiences',
      category: 'Support',
      created_by: 1
    },
    {
      name: 'Research Updates',
      description: 'Latest research findings and scientific discussions',
      category: 'Research',
      created_by: 1
    },
    {
      name: 'Living with Condition',
      description: 'Tips and advice for day-to-day life management',
      category: 'Lifestyle',
      created_by: 1
    },
    {
      name: 'Questions & Answers',
      description: 'Ask questions and get answers from the community',
      category: 'General',
      created_by: 1
    }
  ];

  try {
    // Check if forums already exist
    const [existingForums] = await promisePool.query('SELECT COUNT(*) as count FROM Forums');

    if (existingForums[0].count > 0) {
      console.log(`Found ${existingForums[0].count} existing forums. Skipping creation.`);
      console.log('To recreate forums, delete existing ones first.');
      process.exit(0);
    }

    // Get a valid user ID (preferably a researcher)
    const [users] = await promisePool.query(
      "SELECT id FROM Users WHERE user_type IN ('researcher', 'health_expert') LIMIT 1"
    );

    let creatorId = 1;
    if (users.length > 0) {
      creatorId = users[0].id;
      console.log(`Using user ID ${creatorId} as forum creator`);
    } else {
      console.log('No researcher found, using ID 1 as placeholder');
    }

    // Insert default forums
    let insertedCount = 0;
    for (const forum of defaultForums) {
      try {
        await promisePool.query(
          'INSERT INTO Forums (name, description, category, created_by) VALUES (?, ?, ?, ?)',
          [forum.name, forum.description, forum.category, creatorId]
        );
        insertedCount++;
        console.log(`✓ Created forum: ${forum.name}`);
      } catch (error) {
        console.error(`✗ Error creating forum "${forum.name}":`, error.message);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Successfully created ${insertedCount} out of ${defaultForums.length} forums`);
    console.log('Default forums added successfully!');

  } catch (error) {
    console.error('Error adding default forums:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
addDefaultForums();
