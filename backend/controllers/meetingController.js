const { promisePool } = require('../config/database');

// Get meeting requests (sent or received)
exports.getMeetings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, status } = req.query; // type: 'sent' or 'received'

    let query = `
      SELECT m.*,
             u1.name as requester_name, u1.email as requester_email,
             u2.name as expert_name, u2.email as expert_email
      FROM MeetingRequests m
      JOIN Users u1 ON m.requester_id = u1.id
      JOIN Users u2 ON m.expert_id = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (type === 'sent') {
      query += ` AND m.requester_id = ?`;
      params.push(userId);
    } else if (type === 'received') {
      query += ` AND m.expert_id = ?`;
      params.push(userId);
    } else {
      query += ` AND (m.requester_id = ? OR m.expert_id = ?)`;
      params.push(userId, userId);
    }

    if (status) {
      query += ` AND m.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY m.created_at DESC`;

    const [meetings] = await promisePool.query(query, params);

    res.json(meetings);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Request a meeting
exports.requestMeeting = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { expert_id, message, preferred_date } = req.body;

    if (!expert_id) {
      return res.status(400).json({ error: 'expert_id is required' });
    }

    // Check if expert exists
    const [experts] = await promisePool.query(
      'SELECT id FROM Users WHERE id = ? AND user_type IN (?, ?)',
      [expert_id, 'health_expert', 'researcher']
    );

    if (experts.length === 0) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    // Check if there's already a pending request
    const [existing] = await promisePool.query(
      `SELECT id FROM MeetingRequests
       WHERE requester_id = ? AND expert_id = ? AND status = 'pending'`,
      [requesterId, expert_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'You already have a pending meeting request with this expert'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO MeetingRequests (requester_id, expert_id, message, preferred_date)
       VALUES (?, ?, ?, ?)`,
      [requesterId, expert_id, message, preferred_date]
    );

    res.status(201).json({
      message: 'Meeting request sent successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Request meeting error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update meeting request status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, meeting_link, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const validStatuses = ['pending', 'accepted', 'declined', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: pending, accepted, declined, or completed'
      });
    }

    // Get meeting request
    const [meetings] = await promisePool.query(
      'SELECT * FROM MeetingRequests WHERE id = ?',
      [id]
    );

    if (meetings.length === 0) {
      return res.status(404).json({ error: 'Meeting request not found' });
    }

    const meeting = meetings[0];

    // Only expert can accept/decline, both can mark as completed
    if (status === 'accepted' || status === 'declined') {
      if (meeting.expert_id !== userId) {
        return res.status(403).json({ error: 'Only the expert can accept or decline' });
      }
    }

    const updates = ['status = ?'];
    const values = [status];

    if (meeting_link) {
      updates.push('meeting_link = ?');
      values.push(meeting_link);
    }

    if (notes) {
      updates.push('notes = ?');
      values.push(notes);
    }

    values.push(id);

    await promisePool.query(
      `UPDATE MeetingRequests SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Meeting request updated successfully' });
  } catch (error) {
    console.error('Update meeting status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Request collaboration
exports.requestCollaboration = async (req, res) => {
  try {
    const researcher1Id = req.user.id;
    const { researcher2_id, project_title, description } = req.body;

    if (!researcher2_id) {
      return res.status(400).json({ error: 'researcher2_id is required' });
    }

    // Prevent sending request to yourself
    if (parseInt(researcher2_id) === parseInt(researcher1Id)) {
      return res.status(400).json({ error: 'Cannot send collaboration request to yourself' });
    }

    // Check if researcher exists
    const [researchers] = await promisePool.query(
      'SELECT id FROM Users WHERE id = ? AND user_type = ?',
      [researcher2_id, 'researcher']
    );

    if (researchers.length === 0) {
      return res.status(404).json({ error: 'Researcher not found' });
    }

    // Check if collaboration already exists
    const [existing] = await promisePool.query(
      `SELECT id FROM Collaborations
       WHERE (researcher1_id = ? AND researcher2_id = ?)
          OR (researcher1_id = ? AND researcher2_id = ?)`,
      [researcher1Id, researcher2_id, researcher2_id, researcher1Id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Collaboration request already exists between these researchers'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO Collaborations (researcher1_id, researcher2_id, project_title, description)
       VALUES (?, ?, ?, ?)`,
      [researcher1Id, researcher2_id, project_title, description]
    );

    res.status(201).json({
      message: 'Collaboration request sent successfully',
      collaborationId: result.insertId
    });
  } catch (error) {
    console.error('Request collaboration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get collaborations
exports.getCollaborations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT c.*,
             u1.name as researcher1_name, u1.email as researcher1_email,
             u2.name as researcher2_name, u2.email as researcher2_email
      FROM Collaborations c
      JOIN Users u1 ON c.researcher1_id = u1.id
      JOIN Users u2 ON c.researcher2_id = u2.id
      WHERE (c.researcher1_id = ? OR c.researcher2_id = ?)
    `;
    const params = [userId, userId];

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [collaborations] = await promisePool.query(query, params);

    res.json(collaborations);
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update collaboration status
exports.updateCollaborationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const validStatuses = ['pending', 'active', 'completed', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: pending, active, completed, or declined'
      });
    }

    // Get collaboration
    const [collaborations] = await promisePool.query(
      'SELECT * FROM Collaborations WHERE id = ?',
      [id]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const collab = collaborations[0];

    // Check permission
    if (collab.researcher1_id !== userId && collab.researcher2_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await promisePool.query(
      'UPDATE Collaborations SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Collaboration updated successfully' });
  } catch (error) {
    console.error('Update collaboration status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
