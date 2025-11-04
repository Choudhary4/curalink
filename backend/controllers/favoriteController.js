const { promisePool } = require('../config/database');
const clinicalTrialsService = require('../services/clinicalTrialsService');
const pubmedService = require('../services/pubmedService');

// Helper function to check if ID is an external NCT ID
const isNctId = (id) => {
  return typeof id === 'string' && /^NCT\d+$/i.test(id);
};

// Helper function to check if ID is a PubMed ID
const isPubMedId = (id) => {
  return typeof id === 'string' && /^\d+$/.test(id) && id.length >= 7;
};

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_type } = req.query;

    let query = `
      SELECT f.*, f.item_type, f.item_id, f.created_at
      FROM Favorites f
      WHERE f.user_id = ?
    `;
    const params = [userId];

    if (item_type) {
      query += ` AND f.item_type = ?`;
      params.push(item_type);
    }

    query += ` ORDER BY f.created_at DESC`;

    const [favorites] = await promisePool.query(query, params);

    // Fetch details for each favorite
    const detailedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let details = null;

        switch (fav.item_type) {
          case 'trial':
            // Try to fetch from local database first
            const [trials] = await promisePool.query(
              'SELECT * FROM ClinicalTrials WHERE id = ?',
              [fav.item_id]
            );
            details = trials[0] || null;

            // If not found locally and it's an NCT ID, fetch from ClinicalTrials.gov
            if (!details && isNctId(fav.item_id)) {
              try {
                console.log(`Fetching external trial: ${fav.item_id}`);
                const trialData = await clinicalTrialsService.getTrialDetails(fav.item_id);

                // Parse the external trial data into our format
                if (trialData && trialData.full_data) {
                  const protocolSection = trialData.full_data;
                  const identificationModule = protocolSection.identificationModule || {};
                  const statusModule = protocolSection.statusModule || {};
                  const descriptionModule = protocolSection.descriptionModule || {};
                  const conditionsModule = protocolSection.conditionsModule || {};
                  const designModule = protocolSection.designModule || {};
                  const eligibilityModule = protocolSection.eligibilityModule || {};
                  const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
                  const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};

                  // Extract locations
                  let locations = [];
                  if (contactsLocationsModule.locations) {
                    locations = contactsLocationsModule.locations.map(loc => {
                      const city = loc.city || '';
                      const state = loc.state || '';
                      const country = loc.country || '';
                      return [city, state, country].filter(Boolean).join(', ');
                    }).slice(0, 5);
                  }

                  details = {
                    id: fav.item_id,
                    nct_id: identificationModule.nctId || fav.item_id,
                    title: identificationModule.briefTitle || 'Untitled Study',
                    description: descriptionModule.briefSummary || 'No description available',
                    phase: designModule.phases ? designModule.phases.join(', ') : 'Not specified',
                    status: statusModule.overallStatus || 'Unknown',
                    sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'Unknown',
                    conditions: conditionsModule.conditions ? conditionsModule.conditions.join(', ') : 'Not specified',
                    locations: locations.length > 0 ? locations : ['Location not specified'],
                    enrollment: statusModule.enrollmentInfo?.count || null,
                    start_date: statusModule.startDateStruct?.date || 'Not specified',
                    completion_date: statusModule.completionDateStruct?.date || 'Not specified',
                    eligibility: eligibilityModule.eligibilityCriteria || 'Not specified',
                    min_age: eligibilityModule.minimumAge || 'Not specified',
                    max_age: eligibilityModule.maximumAge || 'Not specified',
                    gender: eligibilityModule.sex || 'All',
                    url: `https://clinicaltrials.gov/study/${fav.item_id}`,
                    recruiting: statusModule.overallStatus === 'RECRUITING' || statusModule.overallStatus === 'NOT_YET_RECRUITING'
                  };
                }
              } catch (externalError) {
                console.error(`Error fetching external trial ${fav.item_id}:`, externalError.message);
              }
            }
            break;

          case 'publication':
            // Try to fetch from local database first
            const [pubs] = await promisePool.query(
              'SELECT * FROM Publications WHERE id = ?',
              [fav.item_id]
            );
            details = pubs[0] || null;

            // If not found locally and it's a PubMed ID, fetch from PubMed
            if (!details && isPubMedId(fav.item_id)) {
              try {
                console.log(`Fetching external publication: ${fav.item_id}`);
                const publications = await pubmedService.searchPubMed(`${fav.item_id}[uid]`, 1);

                if (publications && publications.length > 0) {
                  const pub = publications[0];
                  details = {
                    id: fav.item_id,
                    pubmed_id: pub.pubmed_id,
                    title: pub.title,
                    authors: pub.authors,
                    journal: pub.journal,
                    publication_date: pub.publication_date,
                    abstract: pub.abstract,
                    doi: pub.doi,
                    url: pub.url,
                    relevance_score: pub.relevance_score
                  };
                }
              } catch (externalError) {
                console.error(`Error fetching external publication ${fav.item_id}:`, externalError.message);
              }
            }
            break;

          case 'researcher':
          case 'expert':
            const [users] = await promisePool.query(
              `SELECT u.id, u.name, u.email, u.user_type,
                      r.specialties, r.institution, r.bio
               FROM Users u
               LEFT JOIN ResearcherProfiles r ON u.id = r.user_id
               WHERE u.id = ?`,
              [fav.item_id]
            );
            details = users[0] || null;
            if (details && details.specialties) {
              details.specialties = JSON.parse(details.specialties);
            }
            break;
        }

        return {
          ...fav,
          details
        };
      })
    );

    res.json(detailedFavorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add favorite
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_type, item_id } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'item_type and item_id are required' });
    }

    const validTypes = ['trial', 'publication', 'researcher', 'expert'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({
        error: 'Invalid item_type. Must be: trial, publication, researcher, or expert'
      });
    }

    // Check if already favorited
    const [existing] = await promisePool.query(
      'SELECT id FROM Favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, item_type, item_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Item already in favorites' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO Favorites (user_id, item_type, item_id) VALUES (?, ?, ?)',
      [userId, item_type, item_id]
    );

    res.status(201).json({
      message: 'Added to favorites',
      favoriteId: result.insertId
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove favorite
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_type, item_id } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'item_type and item_id are required' });
    }

    const [result] = await promisePool.query(
      'DELETE FROM Favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, item_type, item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if item is favorited
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_type, item_id } = req.query;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'item_type and item_id are required' });
    }

    const [favorites] = await promisePool.query(
      'SELECT id FROM Favorites WHERE user_id = ? AND item_type = ? AND item_id = ?',
      [userId, item_type, item_id]
    );

    res.json({
      isFavorited: favorites.length > 0
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
