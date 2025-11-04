const { promisePool } = require('../config/database');

// Get all forums
exports.getForums = async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT f.*, u.name as creator_name
      FROM Forums f
      JOIN Users u ON f.created_by = u.id
      WHERE f.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += ` AND f.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY f.updated_at DESC`;

    const [forums] = await promisePool.query(query, params);

    res.json(forums);
  } catch (error) {
    console.error('Get forums error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new forum
exports.createForum = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Forum name is required' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO Forums (name, description, category, created_by) VALUES (?, ?, ?, ?)',
      [name, description, category, userId]
    );

    res.status(201).json({
      message: 'Forum created successfully',
      forumId: result.insertId
    });
  } catch (error) {
    console.error('Create forum error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get posts in a forum
exports.getForumPosts = async (req, res) => {
  try {
    const { forumId } = req.params;

    const [posts] = await promisePool.query(
      `SELECT p.*, u.name as author_name, u.user_type
       FROM ForumPosts p
       JOIN Users u ON p.user_id = u.id
       WHERE p.forum_id = ?
       ORDER BY p.is_pinned DESC, p.created_at DESC`,
      [forumId]
    );

    res.json(posts);
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new post in forum
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { forumId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if forum exists
    const [forums] = await promisePool.query(
      'SELECT id FROM Forums WHERE id = ? AND is_active = TRUE',
      [forumId]
    );

    if (forums.length === 0) {
      return res.status(404).json({ error: 'Forum not found' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO ForumPosts (forum_id, user_id, title, content) VALUES (?, ?, ?, ?)',
      [forumId, userId, title, content]
    );

    // Update forum post count
    await promisePool.query(
      'UPDATE Forums SET post_count = post_count + 1, updated_at = NOW() WHERE id = ?',
      [forumId]
    );

    res.status(201).json({
      message: 'Post created successfully',
      postId: result.insertId
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get post with replies
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post
    const [posts] = await promisePool.query(
      `SELECT p.*, u.name as author_name, u.user_type
       FROM ForumPosts p
       JOIN Users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];

    // Get replies
    const [replies] = await promisePool.query(
      `SELECT r.*, u.name as author_name, u.user_type
       FROM ForumReplies r
       JOIN Users u ON r.user_id = u.id
       WHERE r.post_id = ?
       ORDER BY r.created_at ASC`,
      [postId]
    );

    post.replies = replies;

    // Increment view count
    await promisePool.query(
      'UPDATE ForumPosts SET view_count = view_count + 1 WHERE id = ?',
      [postId]
    );

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create reply to post
exports.createReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if post exists
    const [posts] = await promisePool.query(
      'SELECT id FROM ForumPosts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO ForumReplies (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    // Update post reply count
    await promisePool.query(
      'UPDATE ForumPosts SET reply_count = reply_count + 1, updated_at = NOW() WHERE id = ?',
      [postId]
    );

    res.status(201).json({
      message: 'Reply created successfully',
      replyId: result.insertId
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
