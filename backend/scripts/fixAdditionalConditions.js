const { promisePool } = require('../config/database');

async function fixAdditionalConditions() {
  console.log('Starting to fix additional_conditions data...');

  try {
    // Get all patient profiles with additional_conditions
    const [profiles] = await promisePool.query(
      'SELECT user_id, additional_conditions FROM PatientProfiles WHERE additional_conditions IS NOT NULL AND additional_conditions != ""'
    );

    console.log(`Found ${profiles.length} profiles with additional_conditions data`);

    let fixedCount = 0;
    let alreadyValidCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      // Convert to string if it's a Buffer or other type
      let currentValue = profile.additional_conditions;
      if (Buffer.isBuffer(currentValue)) {
        currentValue = currentValue.toString('utf8');
      } else if (typeof currentValue !== 'string') {
        currentValue = String(currentValue);
      }

      try {
        // Try to parse as JSON - if it succeeds, it's already valid
        JSON.parse(currentValue);
        alreadyValidCount++;
        console.log(`✓ User ${profile.user_id}: Already valid JSON`);
      } catch (e) {
        // If parsing fails, it's malformed - need to fix it
        console.log(`✗ User ${profile.user_id}: Invalid JSON - "${currentValue}"`);

        let fixedValue;

        // If it's a simple string like "lung cancer", convert to ["lung cancer"]
        if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
          // Remove quotes and wrap in array
          const unquoted = currentValue.slice(1, -1);
          fixedValue = JSON.stringify([unquoted]);
        }
        // If it's a plain string without quotes, wrap it in array
        else if (!currentValue.startsWith('[') && !currentValue.startsWith('{')) {
          fixedValue = JSON.stringify([currentValue]);
        }
        // If it's comma-separated values, split and create array
        else if (currentValue.includes(',') && !currentValue.startsWith('[')) {
          const values = currentValue.split(',').map(v => v.trim().replace(/"/g, ''));
          fixedValue = JSON.stringify(values);
        }
        else {
          // Unknown format, default to empty array
          console.warn(`  Unknown format, setting to empty array`);
          fixedValue = JSON.stringify([]);
        }

        // Update the database
        await promisePool.query(
          'UPDATE PatientProfiles SET additional_conditions = ? WHERE user_id = ?',
          [fixedValue, profile.user_id]
        );

        fixedCount++;
        console.log(`  → Fixed to: ${fixedValue}`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total profiles checked: ${profiles.length}`);
    console.log(`Already valid: ${alreadyValidCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Database cleanup completed successfully!');

  } catch (error) {
    console.error('Error fixing additional_conditions:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the fix
fixAdditionalConditions();
