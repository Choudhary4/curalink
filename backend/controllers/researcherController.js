const { promisePool } = require('../config/database');

// Get researcher profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [profiles] = await promisePool.query(
      `SELECT r.*, u.name, u.email
       FROM ResearcherProfiles r
       JOIN Users u ON r.user_id = u.id
       WHERE r.user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Researcher profile not found' });
    }

    // Parse JSON fields
    const profile = profiles[0];
    if (profile.specialties) {
      try {
        profile.specialties = JSON.parse(profile.specialties);
      } catch (e) {
        console.warn('Failed to parse specialties:', profile.specialties);
        profile.specialties = [];
      }
    }
    if (profile.research_interests) {
      try {
        profile.research_interests = JSON.parse(profile.research_interests);
      } catch (e) {
        console.warn('Failed to parse research_interests:', profile.research_interests);
        profile.research_interests = [];
      }
    }

    res.json(profile);
  } catch (error) {
    console.error('Get researcher profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update researcher profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      specialties,
      research_interests,
      institution,
      orcid,
      researchgate,
      google_scholar,
      availability,
      bio,
      years_experience
    } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (specialties !== undefined) {
      updates.push('specialties = ?');
      values.push(JSON.stringify(specialties));
    }
    if (research_interests !== undefined) {
      updates.push('research_interests = ?');
      values.push(JSON.stringify(research_interests));
    }
    if (institution !== undefined) {
      updates.push('institution = ?');
      values.push(institution);
    }
    if (orcid !== undefined) {
      updates.push('orcid = ?');
      values.push(orcid);
    }
    if (researchgate !== undefined) {
      updates.push('researchgate = ?');
      values.push(researchgate);
    }
    if (google_scholar !== undefined) {
      updates.push('google_scholar = ?');
      values.push(google_scholar);
    }
    if (availability !== undefined) {
      updates.push('availability = ?');
      values.push(availability);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (years_experience !== undefined) {
      updates.push('years_experience = ?');
      values.push(years_experience);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await promisePool.query(
      `UPDATE ResearcherProfiles SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    // Fetch updated profile
    const [profiles] = await promisePool.query(
      'SELECT * FROM ResearcherProfiles WHERE user_id = ?',
      [userId]
    );

    const profile = profiles[0];
    if (profile.specialties) {
      try {
        profile.specialties = JSON.parse(profile.specialties);
      } catch (e) {
        console.warn('Failed to parse specialties:', profile.specialties);
        profile.specialties = [];
      }
    }
    if (profile.research_interests) {
      try {
        profile.research_interests = JSON.parse(profile.research_interests);
      } catch (e) {
        console.warn('Failed to parse research_interests:', profile.research_interests);
        profile.research_interests = [];
      }
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update researcher profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get list of researchers/experts with filters
exports.getExperts = async (req, res) => {
  try {
    const { specialty, availability, user_type } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.user_type,
             r.specialties, r.research_interests, r.institution,
             r.availability, r.bio, r.years_experience
      FROM ResearcherProfiles r
      JOIN Users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (specialty) {
      query += ` AND r.specialties LIKE ?`;
      params.push(`%${specialty}%`);
    }

    if (availability) {
      query += ` AND r.availability = ?`;
      params.push(availability);
    }

    if (user_type === 'health_expert') {
      query += ` AND u.user_type = 'health_expert'`;
    } else if (user_type === 'researcher') {
      query += ` AND u.user_type = 'researcher'`;
    }

    query += ` ORDER BY r.years_experience DESC LIMIT 50`;

    const [experts] = await promisePool.query(query, params);

    // Parse JSON fields
    experts.forEach(expert => {
      if (expert.specialties) {
        try {
          expert.specialties = JSON.parse(expert.specialties);
        } catch (e) {
          console.warn('Failed to parse specialties:', expert.specialties);
          expert.specialties = [];
        }
      }
      if (expert.research_interests) {
        try {
          expert.research_interests = JSON.parse(expert.research_interests);
        } catch (e) {
          console.warn('Failed to parse research_interests:', expert.research_interests);
          expert.research_interests = [];
        }
      }
    });

    res.json(experts);
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Find potential collaborators
exports.getCollaborators = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    // Get all researchers except the current user
    const query = userId
      ? `SELECT u.id, u.name, u.email,
                r.specialties, r.research_interests, r.institution,
                r.availability, r.bio
         FROM ResearcherProfiles r
         JOIN Users u ON r.user_id = u.id
         WHERE u.user_type = 'researcher' AND u.id != ?
         ORDER BY RAND()
         LIMIT 50`
      : `SELECT u.id, u.name, u.email,
                r.specialties, r.research_interests, r.institution,
                r.availability, r.bio
         FROM ResearcherProfiles r
         JOIN Users u ON r.user_id = u.id
         WHERE u.user_type = 'researcher'
         ORDER BY RAND()
         LIMIT 50`;

    const params = userId ? [userId] : [];
    const [collaborators] = await promisePool.query(query, params);

    // Parse JSON fields
    collaborators.forEach(collab => {
      if (collab.specialties) {
        try {
          collab.specialties = JSON.parse(collab.specialties);
        } catch (e) {
          console.warn('Failed to parse specialties:', collab.specialties);
          collab.specialties = [];
        }
      }
      if (collab.research_interests) {
        try {
          collab.research_interests = JSON.parse(collab.research_interests);
        } catch (e) {
          console.warn('Failed to parse research_interests:', collab.research_interests);
          collab.research_interests = [];
        }
      }
    });

    res.json(collaborators);
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
