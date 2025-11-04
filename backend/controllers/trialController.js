const { promisePool } = require('../config/database');
const axios = require('axios');
const clinicalTrialsService = require('../services/clinicalTrialsService');

// Get clinical trials with filters - now uses ClinicalTrials.gov API
exports.getTrials = async (req, res) => {
  try {
    const { condition, phase, status, country, search, useLive = 'true' } = req.query;

    // Use live ClinicalTrials.gov API if requested (default)
    if (useLive === 'true' && (condition || search)) {
      const searchTerm = condition || search;
      const location = country || null;
      const trials = await clinicalTrialsService.searchTrials(searchTerm, location, 20);

      // Apply phase filter if specified
      let filteredTrials = trials;
      if (phase) {
        filteredTrials = trials.filter(t => t.phase && t.phase.toLowerCase().includes(phase.toLowerCase()));
      }
      if (status) {
        filteredTrials = filteredTrials.filter(t => t.status && t.status.toLowerCase() === status.toLowerCase());
      }

      return res.json(filteredTrials);
    }

    // Fall back to database for backward compatibility
    let query = 'SELECT * FROM ClinicalTrials WHERE 1=1';
    const params = [];

    if (condition) {
      query += ` AND (conditions LIKE ? OR title LIKE ? OR description LIKE ?)`;
      params.push(`%${condition}%`, `%${condition}%`, `%${condition}%`);
    }

    if (phase) {
      query += ` AND phase = ?`;
      params.push(phase);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (country) {
      query += ` AND country = ?`;
      params.push(country);
    }

    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const [trials] = await promisePool.query(query, params);

    // Parse JSON fields
    trials.forEach(trial => {
      if (trial.conditions) {
        trial.conditions = JSON.parse(trial.conditions);
      }
    });

    res.json(trials);
  } catch (error) {
    console.error('Get trials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single trial by ID
exports.getTrial = async (req, res) => {
  try {
    const { id } = req.params;

    const [trials] = await promisePool.query(
      'SELECT * FROM ClinicalTrials WHERE id = ?',
      [id]
    );

    if (trials.length === 0) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    const trial = trials[0];
    if (trial.conditions) {
      trial.conditions = JSON.parse(trial.conditions);
    }

    res.json(trial);
  } catch (error) {
    console.error('Get trial error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new clinical trial
exports.createTrial = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nct_id,
      title,
      description,
      phase,
      status,
      location,
      country,
      eligibility,
      conditions,
      intervention,
      sponsor,
      contact_email,
      contact_phone,
      study_url,
      enrollment_count,
      start_date,
      completion_date
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const [result] = await promisePool.query(
      `INSERT INTO ClinicalTrials (
        nct_id, title, description, phase, status, location, country,
        eligibility, conditions, intervention, sponsor, contact_email,
        contact_phone, study_url, enrollment_count, start_date,
        completion_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nct_id, title, description, phase, status, location, country,
        eligibility, JSON.stringify(conditions), intervention, sponsor,
        contact_email, contact_phone, study_url, enrollment_count,
        start_date, completion_date, userId
      ]
    );

    res.status(201).json({
      message: 'Clinical trial created successfully',
      trialId: result.insertId
    });
  } catch (error) {
    console.error('Create trial error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update clinical trial
exports.updateTrial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if trial exists and user has permission
    const [trials] = await promisePool.query(
      'SELECT created_by FROM ClinicalTrials WHERE id = ?',
      [id]
    );

    if (trials.length === 0) {
      return res.status(404).json({ error: 'Trial not found' });
    }

    if (trials[0].created_by !== userId && req.user.user_type !== 'health_expert') {
      return res.status(403).json({ error: 'Not authorized to update this trial' });
    }

    const {
      title,
      description,
      phase,
      status,
      location,
      country,
      eligibility,
      conditions,
      intervention,
      sponsor,
      contact_email,
      contact_phone,
      study_url,
      enrollment_count,
      start_date,
      completion_date
    } = req.body;

    // Build update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (phase !== undefined) {
      updates.push('phase = ?');
      values.push(phase);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      values.push(country);
    }
    if (eligibility !== undefined) {
      updates.push('eligibility = ?');
      values.push(eligibility);
    }
    if (conditions !== undefined) {
      updates.push('conditions = ?');
      values.push(JSON.stringify(conditions));
    }
    if (intervention !== undefined) {
      updates.push('intervention = ?');
      values.push(intervention);
    }
    if (sponsor !== undefined) {
      updates.push('sponsor = ?');
      values.push(sponsor);
    }
    if (contact_email !== undefined) {
      updates.push('contact_email = ?');
      values.push(contact_email);
    }
    if (contact_phone !== undefined) {
      updates.push('contact_phone = ?');
      values.push(contact_phone);
    }
    if (study_url !== undefined) {
      updates.push('study_url = ?');
      values.push(study_url);
    }
    if (enrollment_count !== undefined) {
      updates.push('enrollment_count = ?');
      values.push(enrollment_count);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }
    if (completion_date !== undefined) {
      updates.push('completion_date = ?');
      values.push(completion_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await promisePool.query(
      `UPDATE ClinicalTrials SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Trial updated successfully' });
  } catch (error) {
    console.error('Update trial error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search ClinicalTrials.gov API - updated to use service
exports.searchClinicalTrialsGov = async (req, res) => {
  try {
    const { query, condition, location } = req.query;

    if (!query && !condition) {
      return res.status(400).json({ error: 'Query or condition parameter required' });
    }

    const searchTerm = query || condition;
    const trials = await clinicalTrialsService.searchTrials(searchTerm, location, 20);

    res.json(trials);
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from ClinicalTrials.gov' });
  }
};
