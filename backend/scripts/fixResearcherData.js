const { promisePool } = require('../config/database');

async function fixResearcherData() {
  console.log('Starting to fix researcher profile data...');

  try {
    // Get all researcher profiles
    const [profiles] = await promisePool.query(
      'SELECT user_id, specialties, research_interests FROM ResearcherProfiles WHERE specialties IS NOT NULL OR research_interests IS NOT NULL'
    );

    console.log(`Found ${profiles.length} researcher profiles to check`);

    let specialtiesFixed = 0;
    let specialtiesValid = 0;
    let interestsFixed = 0;
    let interestsValid = 0;

    for (const profile of profiles) {
      let needsUpdate = false;
      let newSpecialties = profile.specialties;
      let newInterests = profile.research_interests;

      // Fix specialties
      if (profile.specialties) {
        let currentValue = profile.specialties;
        if (Buffer.isBuffer(currentValue)) {
          currentValue = currentValue.toString('utf8');
        } else if (typeof currentValue !== 'string') {
          currentValue = String(currentValue);
        }

        try {
          JSON.parse(currentValue);
          specialtiesValid++;
          console.log(`✓ User ${profile.user_id}: specialties already valid`);
        } catch (e) {
          console.log(`✗ User ${profile.user_id}: Invalid specialties - "${currentValue}"`);

          // Convert comma-separated string to array
          if (currentValue.includes(',')) {
            const values = currentValue.split(',').map(v => v.trim().replace(/"/g, ''));
            newSpecialties = JSON.stringify(values);
          } else if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
            const unquoted = currentValue.slice(1, -1);
            newSpecialties = JSON.stringify([unquoted]);
          } else {
            newSpecialties = JSON.stringify([currentValue]);
          }

          specialtiesFixed++;
          needsUpdate = true;
          console.log(`  → Fixed specialties to: ${newSpecialties}`);
        }
      }

      // Fix research_interests
      if (profile.research_interests) {
        let currentValue = profile.research_interests;
        if (Buffer.isBuffer(currentValue)) {
          currentValue = currentValue.toString('utf8');
        } else if (typeof currentValue !== 'string') {
          currentValue = String(currentValue);
        }

        try {
          JSON.parse(currentValue);
          interestsValid++;
          console.log(`✓ User ${profile.user_id}: research_interests already valid`);
        } catch (e) {
          console.log(`✗ User ${profile.user_id}: Invalid research_interests - "${currentValue}"`);

          // Convert comma-separated string to array
          if (currentValue.includes(',')) {
            const values = currentValue.split(',').map(v => v.trim().replace(/"/g, ''));
            newInterests = JSON.stringify(values);
          } else if (currentValue.startsWith('"') && currentValue.endsWith('"')) {
            const unquoted = currentValue.slice(1, -1);
            newInterests = JSON.stringify([unquoted]);
          } else {
            newInterests = JSON.stringify([currentValue]);
          }

          interestsFixed++;
          needsUpdate = true;
          console.log(`  → Fixed research_interests to: ${newInterests}`);
        }
      }

      // Update if needed
      if (needsUpdate) {
        const updates = [];
        const values = [];

        if (profile.specialties && newSpecialties !== profile.specialties) {
          updates.push('specialties = ?');
          values.push(newSpecialties);
        }

        if (profile.research_interests && newInterests !== profile.research_interests) {
          updates.push('research_interests = ?');
          values.push(newInterests);
        }

        if (updates.length > 0) {
          values.push(profile.user_id);
          await promisePool.query(
            `UPDATE ResearcherProfiles SET ${updates.join(', ')} WHERE user_id = ?`,
            values
          );
        }
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total profiles checked: ${profiles.length}`);
    console.log(`Specialties - Already valid: ${specialtiesValid}, Fixed: ${specialtiesFixed}`);
    console.log(`Research interests - Already valid: ${interestsValid}, Fixed: ${interestsFixed}`);
    console.log('Database cleanup completed successfully!');

  } catch (error) {
    console.error('Error fixing researcher data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the fix
fixResearcherData();
