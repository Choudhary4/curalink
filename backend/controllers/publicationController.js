const { promisePool } = require('../config/database');
const axios = require('axios');
const pubmedService = require('../services/pubmedService');
const orcidService = require('../services/orcidService');

// Get publications with search - now uses PubMed API
exports.getPublications = async (req, res) => {
  try {
    const { search, year, author, journal, useLive = 'true' } = req.query;

    // Use live PubMed API if requested (default)
    if (useLive === 'true' && search) {
      const articles = await pubmedService.searchPubMed(search, 20);
      return res.json(articles);
    }

    // Fall back to database for backward compatibility
    let query = 'SELECT * FROM Publications WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (title LIKE ? OR summary LIKE ? OR authors LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (year) {
      query += ` AND year = ?`;
      params.push(year);
    }

    if (author) {
      query += ` AND authors LIKE ?`;
      params.push(`%${author}%`);
    }

    if (journal) {
      query += ` AND journal LIKE ?`;
      params.push(`%${journal}%`);
    }

    query += ` ORDER BY year DESC, citation_count DESC LIMIT 50`;

    const [publications] = await promisePool.query(query, params);

    // Parse JSON fields
    publications.forEach(pub => {
      if (pub.keywords) {
        pub.keywords = JSON.parse(pub.keywords);
      }
    });

    res.json(publications);
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single publication
exports.getPublication = async (req, res) => {
  try {
    const { id } = req.params;

    const [publications] = await promisePool.query(
      'SELECT * FROM Publications WHERE id = ?',
      [id]
    );

    if (publications.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const publication = publications[0];
    if (publication.keywords) {
      publication.keywords = JSON.parse(publication.keywords);
    }

    res.json(publication);
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search PubMed - updated to use service
exports.searchPubMed = async (req, res) => {
  try {
    const { query, retmax = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const articles = await pubmedService.searchPubMed(query, retmax);
    res.json(articles);
  } catch (error) {
    console.error('PubMed search error:', error.message);
    res.status(500).json({ error: 'Failed to search PubMed' });
  }
};

// Save publication to database
exports.savePublication = async (req, res) => {
  try {
    const {
      title,
      authors,
      journal,
      year,
      pubmed_id,
      doi,
      summary,
      keywords,
      citation_count,
      url
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check if publication already exists
    if (pubmed_id) {
      const [existing] = await promisePool.query(
        'SELECT id FROM Publications WHERE pubmed_id = ?',
        [pubmed_id]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          error: 'Publication already exists',
          publicationId: existing[0].id
        });
      }
    }

    const [result] = await promisePool.query(
      `INSERT INTO Publications (
        title, authors, journal, year, pubmed_id, doi, summary,
        keywords, citation_count, url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, authors, journal, year, pubmed_id, doi, summary,
        JSON.stringify(keywords), citation_count || 0, url
      ]
    );

    res.status(201).json({
      message: 'Publication saved successfully',
      publicationId: result.insertId
    });
  } catch (error) {
    console.error('Save publication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get ORCID profile - updated to use service
exports.getOrcidProfile = async (req, res) => {
  try {
    const { orcid } = req.params;

    if (!orcid) {
      return res.status(400).json({ error: 'ORCID ID required' });
    }

    const profile = await orcidService.getResearcherProfile(orcid);
    res.json(profile);
  } catch (error) {
    console.error('ORCID API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch ORCID profile' });
  }
};

// Search ORCID for researchers
exports.searchOrcid = async (req, res) => {
  try {
    const { query, maxResults = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const researchers = await orcidService.searchResearchers(query, maxResults);
    res.json(researchers);
  } catch (error) {
    console.error('ORCID search error:', error.message);
    res.status(500).json({ error: 'Failed to search ORCID' });
  }
};
