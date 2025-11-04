const axios = require('axios');

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Search PubMed for articles
exports.searchPubMed = async (query, maxResults = 10) => {
  try {
    console.log(`Searching PubMed for: ${query}`);

    // Step 1: Search for article IDs
    const searchResponse = await axios.get(`${PUBMED_BASE_URL}/esearch.fcgi`, {
      params: {
        db: 'pubmed',
        term: query,
        retmax: maxResults,
        retmode: 'json',
        sort: 'relevance'
      }
    });

    const ids = searchResponse.data.esearchresult.idlist;

    if (ids.length === 0) {
      console.log('No PubMed results found');
      return [];
    }

    console.log(`Found ${ids.length} PubMed articles`);

    // Step 2: Fetch article details
    const detailsResponse = await axios.get(`${PUBMED_BASE_URL}/esummary.fcgi`, {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'json'
      }
    });

    // Step 3: Fetch full abstracts using efetch
    const abstractsResponse = await axios.get(`${PUBMED_BASE_URL}/efetch.fcgi`, {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml'
      }
    });

    // Parse XML to extract abstracts
    const xmlData = abstractsResponse.data;
    const abstractsMap = {};

    // Extract abstracts for each article
    const articleMatches = xmlData.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g);
    for (const match of articleMatches) {
      const articleXml = match[1];
      const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const abstractMatch = articleXml.match(/<Abstract>([\s\S]*?)<\/Abstract>/);

      if (pmidMatch && abstractMatch) {
        const pmid = pmidMatch[1];
        // Extract all AbstractText elements
        const abstractTexts = [];
        const textMatches = abstractMatch[1].matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
        for (const textMatch of textMatches) {
          const text = textMatch[1].replace(/<[^>]*>/g, '').trim();
          if (text) abstractTexts.push(text);
        }
        abstractsMap[pmid] = abstractTexts.join('\n\n');
      }
    }

    const articles = [];
    const results = detailsResponse.data.result;

    for (const id of ids) {
      const article = results[id];
      if (article && article.title) {
        // Parse authors
        let authors = 'Unknown';
        if (article.authors && article.authors.length > 0) {
          const authorNames = article.authors.map(a => a.name).slice(0, 3);
          authors = authorNames.join(', ');
          if (article.authors.length > 3) {
            authors += ' et al.';
          }
        }

        // Parse publication date
        let pubDate = 'Unknown';
        if (article.pubdate) {
          pubDate = article.pubdate;
        }

        // Parse journal
        let journal = 'Unknown';
        if (article.fulljournalname) {
          journal = article.fulljournalname;
        } else if (article.source) {
          journal = article.source;
        }

        articles.push({
          id: id, // Use PubMed ID as the primary identifier
          pubmed_id: id,
          title: article.title,
          authors: authors,
          journal: journal,
          publication_date: pubDate,
          abstract: abstractsMap[id] || 'No abstract available',
          doi: article.elocationid || null,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, // Add link field for compatibility
          relevance_score: 1.0 - (articles.length / ids.length) // Simple relevance scoring
        });
      }
    }

    console.log(`Parsed ${articles.length} articles successfully`);
    return articles;

  } catch (error) {
    console.error('PubMed API error:', error.message);
    throw new Error('Failed to fetch publications from PubMed');
  }
};

// Fetch abstract for a specific PubMed article
exports.fetchAbstract = async (pubmedId) => {
  try {
    const response = await axios.get(`${PUBMED_BASE_URL}/efetch.fcgi`, {
      params: {
        db: 'pubmed',
        id: pubmedId,
        retmode: 'xml'
      }
    });

    // Simple XML parsing to extract abstract
    const xmlData = response.data;
    const abstractMatch = xmlData.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/);

    if (abstractMatch && abstractMatch[1]) {
      // Remove XML tags from abstract
      return abstractMatch[1].replace(/<[^>]*>/g, '');
    }

    return 'No abstract available';

  } catch (error) {
    console.error('Error fetching abstract:', error.message);
    return 'No abstract available';
  }
};
