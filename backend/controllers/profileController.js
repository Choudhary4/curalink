const { promisePool } = require('../config/database');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const [users] = await promisePool.query(
      'SELECT id, email, name, user_type, profile_picture, created_at FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get profile-specific data based on user type
    let profileData = null;
    if (user.user_type === 'patient') {
      const [patientProfiles] = await promisePool.query(
        'SELECT * FROM PatientProfiles WHERE user_id = ?',
        [userId]
      );
      profileData = patientProfiles[0] || null;
    } else if (user.user_type === 'researcher') {
      const [researcherProfiles] = await promisePool.query(
        'SELECT * FROM ResearcherProfiles WHERE user_id = ?',
        [userId]
      );
      profileData = researcherProfiles[0] || null;
    }

    res.json({
      ...user,
      profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update profile information
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, ...otherFields } = req.body;

    // Update Users table (name only)
    if (name) {
      await promisePool.query(
        'UPDATE Users SET name = ? WHERE id = ?',
        [name, userId]
      );
    }

    // Get user type to determine which profile table to update
    const [users] = await promisePool.query(
      'SELECT user_type FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userType = users[0].user_type;

    // Update profile-specific data
    if (userType === 'patient' && Object.keys(otherFields).length > 0) {
      const allowedFields = ['condition', 'additional_conditions', 'location', 'country', 'age', 'bio'];
      const updates = [];
      const values = [];

      Object.keys(otherFields).forEach(field => {
        if (allowedFields.includes(field)) {
          // Escape field names with backticks to handle reserved keywords like 'condition'
          updates.push(`\`${field}\` = ?`);
          values.push(
            field === 'additional_conditions'
              ? JSON.stringify(otherFields[field])
              : otherFields[field]
          );
        }
      });

      if (bio) {
        updates.push('`bio` = ?');
        values.push(bio);
      }

      if (updates.length > 0) {
        values.push(userId);
        await promisePool.query(
          `UPDATE PatientProfiles SET ${updates.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    } else if (userType === 'researcher' && Object.keys(otherFields).length > 0) {
      const allowedFields = ['specialties', 'research_interests', 'institution', 'orcid', 'researchgate', 'google_scholar', 'availability', 'bio', 'years_experience'];
      const updates = [];
      const values = [];

      Object.keys(otherFields).forEach(field => {
        if (allowedFields.includes(field)) {
          // Escape field names with backticks for consistency
          updates.push(`\`${field}\` = ?`);
          values.push(
            (field === 'specialties' || field === 'research_interests')
              ? JSON.stringify(otherFields[field])
              : otherFields[field]
          );
        }
      });

      if (bio) {
        updates.push('`bio` = ?');
        values.push(bio);
      }

      if (updates.length > 0) {
        values.push(userId);
        await promisePool.query(
          `UPDATE ResearcherProfiles SET ${updates.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current profile picture to delete old one
    const [users] = await promisePool.query(
      'SELECT profile_picture FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldProfilePicture = users[0].profile_picture;

    // Upload new image to Cloudinary
    console.log('Uploading image to Cloudinary...');
    const result = await uploadToCloudinary(req.file.buffer);
    console.log('Image uploaded successfully:', result.secure_url);

    // Update database with new image URL
    await promisePool.query(
      'UPDATE Users SET profile_picture = ? WHERE id = ?',
      [result.secure_url, userId]
    );

    // Delete old image from Cloudinary if exists
    if (oldProfilePicture) {
      try {
        // Extract public_id from URL
        const urlParts = oldProfilePicture.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue even if deletion fails
      }
    }

    res.json({
      message: 'Profile picture uploaded successfully',
      profile_picture: result.secure_url
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      error: 'Failed to upload profile picture',
      details: error.message
    });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current profile picture
    const [users] = await promisePool.query(
      'SELECT profile_picture FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profilePicture = users[0].profile_picture;

    if (!profilePicture) {
      return res.status(400).json({ error: 'No profile picture to delete' });
    }

    // Delete from Cloudinary
    try {
      const urlParts = profilePicture.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/');
      const publicId = publicIdWithExt.split('.')[0];
      await deleteFromCloudinary(publicId);
    } catch (deleteError) {
      console.error('Error deleting from Cloudinary:', deleteError);
    }

    // Update database
    await promisePool.query(
      'UPDATE Users SET profile_picture = NULL WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
