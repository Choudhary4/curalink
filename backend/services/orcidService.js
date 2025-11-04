const axios = require('axios');

const ORCID_API_BASE = 'https://pub.orcid.org/v3.0';

// Search for researchers by name or affiliation
exports.searchResearchers = async (query, maxResults = 10, fetchDetails = true) => {
  try {
    console.log(`Searching ORCID for: ${query}`);

    const response = await axios.get(`${ORCID_API_BASE}/search/`, {
      params: {
        q: query,
        rows: maxResults
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const results = response.data.result || [];
    console.log(`Found ${results.length} ORCID profiles`);

    // Debug: log first result structure
    if (results.length > 0) {
      console.log('Sample result structure:', JSON.stringify(results[0], null, 2));
    }

    const researchers = [];

    // Process results in parallel with Promise.allSettled for better performance
    const promises = results.map(async (result) => {
      if (!result['orcid-identifier']) return null;

      const orcidId = result['orcid-identifier'].path;

      // If fetchDetails is true, get the full profile for accurate name/affiliation
      if (fetchDetails) {
        try {
          console.log(`Fetching detailed profile for: ${orcidId}`);
          const recordResponse = await axios.get(`${ORCID_API_BASE}/${orcidId}`, {
            headers: {
              'Accept': 'application/json'
            },
            timeout: 5000
          });

          const record = recordResponse.data;
          const person = record.person || {};
          const activitiesSummary = record['activities-summary'] || {};

          return {
            orcid: orcidId,
            name: exports.extractFullName(person),
            affiliation: exports.extractPrimaryAffiliation(activitiesSummary),
            url: `https://orcid.org/${orcidId}`
          };
        } catch (detailError) {
          console.error(`Failed to fetch details for ${orcidId}:`, detailError.message);
          // Fall back to search result data
          return {
            orcid: orcidId,
            name: exports.extractName(result),
            affiliation: exports.extractAffiliation(result),
            url: `https://orcid.org/${orcidId}`
          };
        }
      } else {
        // Use basic search result data (faster)
        return {
          orcid: orcidId,
          name: exports.extractName(result),
          affiliation: exports.extractAffiliation(result),
          url: `https://orcid.org/${orcidId}`
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);

    // Extract successful results
    for (const result of settledResults) {
      if (result.status === 'fulfilled' && result.value) {
        researchers.push(result.value);
      }
    }

    console.log(`Successfully processed ${researchers.length} researchers`);
    return researchers;

  } catch (error) {
    console.error('ORCID search error:', error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('ORCID search timed out. Please try again.');
    }
    throw new Error('Failed to search ORCID. Please try again later.');
  }
};

// Get detailed researcher profile from ORCID
exports.getResearcherProfile = async (orcidId) => {
  try {
    console.log(`Fetching ORCID profile: ${orcidId}`);

    // Fetch full record (includes person and activities-summary)
    const recordResponse = await axios.get(`${ORCID_API_BASE}/${orcidId}`, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const record = recordResponse.data;
    const person = record.person || {};
    const activitiesSummary = record['activities-summary'] || {};

    // Extract profile information
    const profile = {
      orcid: orcidId,
      name: exports.extractFullName(person),
      biography: person.biography?.content || null,
      keywords: exports.extractKeywords(person),
      affiliations: exports.extractEmployment(activitiesSummary),
      education: exports.extractEducation(activitiesSummary),
      publications: exports.extractWorks(activitiesSummary.works || {}),
      publication_count: activitiesSummary.works?.group?.length || 0,
      url: `https://orcid.org/${orcidId}`
    };

    console.log(`Successfully fetched profile for ${profile.name}`);
    return profile;

  } catch (error) {
    console.error(`Error fetching ORCID profile ${orcidId}:`, error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.response?.status === 404) {
      throw new Error('ORCID profile not found');
    }
    throw new Error('Failed to fetch ORCID profile. Please try again later.');
  }
};

// Helper: Extract name from search result
exports.extractName = (result) => {
  // ORCID v3.0 search results structure: data is in 'orcid-search-result'
  const searchResult = result['orcid-search-result'] || result;

  // Try given-names and family-name at root level
  if (searchResult['given-names'] || searchResult['family-name']) {
    const givenNames = searchResult['given-names'] || '';
    const familyName = searchResult['family-name'] || '';
    const fullName = `${givenNames} ${familyName}`.trim();
    if (fullName) return fullName;
  }

  // Try credit-name at root level
  if (searchResult['credit-name']) {
    return searchResult['credit-name'];
  }

  // Try person-summary path (legacy structure)
  if (result['person-summary']?.name) {
    const name = result['person-summary'].name;
    const givenNames = name['given-names']?.value || '';
    const familyName = name['family-name']?.value || '';
    const fullName = `${givenNames} ${familyName}`.trim();
    if (fullName) return fullName;
  }

  // Try credit-name from person-summary
  if (result['person-summary']?.['credit-name']?.value) {
    return result['person-summary']['credit-name'].value;
  }

  return 'Name not public';
};

// Helper: Extract affiliation from search result
exports.extractAffiliation = (result) => {
  // ORCID v3.0 search results structure
  const searchResult = result['orcid-search-result'] || result;

  // Try institution-name at root level
  if (searchResult['institution-name'] && searchResult['institution-name'].length > 0) {
    return searchResult['institution-name'][0];
  }

  // Try employment-summary from person-summary (legacy)
  if (result['person-summary']?.['employment-summary']) {
    const employments = result['person-summary']['employment-summary'];
    if (Array.isArray(employments) && employments.length > 0) {
      const org = employments[0]?.organization?.name;
      if (org) return org;
    }
  }

  return 'Not specified';
};

// Helper: Extract primary affiliation from activities-summary
exports.extractPrimaryAffiliation = (activitiesSummary) => {
  // Try to get from employments first
  if (activitiesSummary && activitiesSummary.employments) {
    const employments = activitiesSummary.employments;

    // Check for affiliation-group structure
    if (employments['affiliation-group'] && employments['affiliation-group'].length > 0) {
      const firstGroup = employments['affiliation-group'][0];
      const summaries = firstGroup['summaries'];
      if (summaries && summaries.length > 0) {
        const employment = summaries[0]['employment-summary'];
        if (employment && employment.organization && employment.organization.name) {
          return employment.organization.name;
        }
      }
    }
  }

  // Fallback: try to extract from education if no employment found
  if (activitiesSummary && activitiesSummary.educations) {
    const educations = activitiesSummary.educations;

    if (educations['affiliation-group'] && educations['affiliation-group'].length > 0) {
      const firstGroup = educations['affiliation-group'][0];
      const summaries = firstGroup['summaries'];
      if (summaries && summaries.length > 0) {
        const education = summaries[0]['education-summary'];
        if (education && education.organization && education.organization.name) {
          return education.organization.name;
        }
      }
    }
  }

  return 'Not specified';
};

// Helper: Extract full name from person record
exports.extractFullName = (person) => {
  if (person.name) {
    const givenNames = person.name['given-names']?.value || '';
    const familyName = person.name['family-name']?.value || '';
    return `${givenNames} ${familyName}`.trim() || 'Unknown';
  }
  return 'Unknown';
};

// Helper: Extract keywords/research areas
exports.extractKeywords = (person) => {
  const keywords = [];

  if (person.keywords && person.keywords.keyword) {
    for (const keyword of person.keywords.keyword) {
      if (keyword.content) {
        keywords.push(keyword.content);
      }
    }
  }

  return keywords;
};

// Helper: Extract employment history
exports.extractEmployment = (activitiesSummary) => {
  const affiliations = [];

  if (activitiesSummary && activitiesSummary.employments) {
    const employmentGroup = activitiesSummary.employments['affiliation-group'];

    if (employmentGroup) {
      for (const group of employmentGroup) {
        const summaries = group['summaries'];
        if (summaries && summaries.length > 0) {
          const employment = summaries[0]['employment-summary'];
          if (employment) {
            affiliations.push({
              organization: employment.organization?.name || 'Unknown',
              role: employment['role-title'] || 'Not specified',
              department: employment.department || null,
              start_date: exports.formatDate(employment['start-date']),
              end_date: exports.formatDate(employment['end-date'])
            });
          }
        }
      }
    }
  }

  return affiliations;
};

// Helper: Extract education history
exports.extractEducation = (activitiesSummary) => {
  const education = [];

  if (activitiesSummary && activitiesSummary.educations) {
    const educationGroup = activitiesSummary.educations['affiliation-group'];

    if (educationGroup) {
      for (const group of educationGroup) {
        const summaries = group['summaries'];
        if (summaries && summaries.length > 0) {
          const edu = summaries[0]['education-summary'];
          if (edu) {
            education.push({
              organization: edu.organization?.name || 'Unknown',
              role: edu['role-title'] || 'Degree',
              department: edu.department || null,
              start_date: exports.formatDate(edu['start-date']),
              end_date: exports.formatDate(edu['end-date'])
            });
          }
        }
      }
    }
  }

  return education;
};

// Helper: Extract publications/works
exports.extractWorks = (works) => {
  const publications = [];

  if (works.group) {
    // Limit to most recent 10 publications
    const groups = works.group.slice(0, 10);

    for (const group of groups) {
      if (group['work-summary'] && group['work-summary'].length > 0) {
        const work = group['work-summary'][0];

        publications.push({
          title: work.title?.title?.value || 'Untitled',
          type: work.type || 'Publication',
          publication_date: exports.formatDate(work['publication-date']),
          journal: work['journal-title']?.value || null,
          url: work['external-ids']?.['external-id']?.[0]?.['external-id-url']?.value || null
        });
      }
    }
  }

  return publications;
};

// Helper: Format ORCID date
exports.formatDate = (dateObj) => {
  if (!dateObj) return null;

  const year = dateObj.year?.value || '';
  const month = dateObj.month?.value || '';
  const day = dateObj.day?.value || '';

  if (year && month && day) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } else if (year && month) {
    return `${year}-${month.padStart(2, '0')}`;
  } else if (year) {
    return year;
  }

  return null;
};
