const axios = require('axios');

const CLINICALTRIALS_API_BASE = 'https://clinicaltrials.gov/api/v2';

// Search for clinical trials
exports.searchTrials = async (condition, location = null, maxResults = 20) => {
  try {
    console.log(`Searching ClinicalTrials.gov for: ${condition}`);

    // Build query parameters
    const params = {
      'query.cond': condition,
      'pageSize': maxResults,
      'format': 'json'
    };

    // Add location filter if provided
    if (location) {
      params['query.locn'] = location;
    }

    // Search for studies
    const response = await axios.get(`${CLINICALTRIALS_API_BASE}/studies`, {
      params: params,
      headers: {
        'Accept': 'application/json'
      }
    });

    const studies = response.data.studies || [];
    console.log(`Found ${studies.length} clinical trials`);

    const trials = [];

    for (const study of studies) {
      const protocolSection = study.protocolSection || {};
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
        }).slice(0, 5); // Limit to first 5 locations
      }

      // Extract eligibility criteria
      let eligibility = 'Not specified';
      if (eligibilityModule.eligibilityCriteria) {
        // Truncate long eligibility text
        eligibility = eligibilityModule.eligibilityCriteria.substring(0, 500);
        if (eligibilityModule.eligibilityCriteria.length > 500) {
          eligibility += '...';
        }
      }

      // Determine trial status
      const status = statusModule.overallStatus || 'Unknown';

      trials.push({
        nct_id: identificationModule.nctId || 'N/A',
        title: identificationModule.briefTitle || 'Untitled Study',
        description: descriptionModule.briefSummary || 'No description available',
        phase: designModule.phases ? designModule.phases.join(', ') : 'Not specified',
        status: status,
        sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'Unknown',
        conditions: conditionsModule.conditions ? conditionsModule.conditions.join(', ') : condition,
        locations: locations.length > 0 ? locations : ['Location not specified'],
        enrollment: statusModule.enrollmentInfo?.count || null,
        start_date: statusModule.startDateStruct?.date || 'Not specified',
        completion_date: statusModule.completionDateStruct?.date || 'Not specified',
        eligibility: eligibility,
        min_age: eligibilityModule.minimumAge || 'Not specified',
        max_age: eligibilityModule.maximumAge || 'Not specified',
        gender: eligibilityModule.sex || 'All',
        url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
        recruiting: status === 'RECRUITING' || status === 'NOT_YET_RECRUITING'
      });
    }

    console.log(`Parsed ${trials.length} trials successfully`);
    return trials;

  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch clinical trials');
  }
};

// Get details of a specific trial by NCT ID
exports.getTrialDetails = async (nctId) => {
  try {
    console.log(`Fetching details for trial: ${nctId}`);

    const response = await axios.get(`${CLINICALTRIALS_API_BASE}/studies/${nctId}`, {
      params: {
        'format': 'json'
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const study = response.data.protocolSection || {};

    // Return detailed information
    return {
      nct_id: nctId,
      full_data: study
    };

  } catch (error) {
    console.error(`Error fetching trial ${nctId}:`, error.message);
    throw new Error('Failed to fetch trial details');
  }
};
