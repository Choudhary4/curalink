import React, { useState, useEffect } from 'react';
import { profile as profileApi } from '../services/api';
import './Profile.css';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.get();
      setProfileData(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.profileData?.bio || '',
        // Patient fields
        condition: response.data.profileData?.condition || '',
        location: response.data.profileData?.location || '',
        country: response.data.profileData?.country || '',
        age: response.data.profileData?.age || '',
        // Researcher fields
        institution: response.data.profileData?.institution || '',
        years_experience: response.data.profileData?.years_experience || '',
        availability: response.data.profileData?.availability || 'available',
        orcid: response.data.profileData?.orcid || '',
        researchgate: response.data.profileData?.researchgate || '',
        google_scholar: response.data.profileData?.google_scholar || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await profileApi.update(formData);
      alert('Profile updated successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await profileApi.uploadPicture(formData);
      alert('Profile picture updated successfully!');
      loadProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await profileApi.deletePicture();
      alert('Profile picture deleted successfully!');
      loadProfile();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete profile picture');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture-wrapper">
            {profileData.profile_picture ? (
              <img
                src={profileData.profile_picture}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <span>{profileData.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            {uploadingImage && (
              <div className="upload-overlay">Uploading...</div>
            )}
          </div>

          <div className="profile-picture-actions">
            <label className="btn-upload">
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </label>
            {profileData.profile_picture && (
              <button
                className="btn-delete-image"
                onClick={handleDeleteImage}
                disabled={uploadingImage}
              >
                Remove Photo
              </button>
            )}
          </div>
          <p className="image-hint">Max size: 5MB. Supported: JPG, PNG, GIF</p>
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-section">
                <h2>Basic Information</h2>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Patient-specific fields */}
              {profileData.user_type === 'patient' && (
                <div className="form-section">
                  <h2>Patient Information</h2>

                  <div className="form-group">
                    <label>Condition</label>
                    <input
                      type="text"
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      placeholder="Primary condition"
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                    />
                  </div>
                </div>
              )}

              {/* Researcher-specific fields */}
              {profileData.user_type === 'researcher' && (
                <div className="form-section">
                  <h2>Researcher Information</h2>

                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Your institution"
                    />
                  </div>

                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>Availability</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                    >
                      <option value="available">Available</option>
                      <option value="limited">Limited</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ORCID</label>
                    <input
                      type="text"
                      name="orcid"
                      value={formData.orcid}
                      onChange={handleInputChange}
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>ResearchGate Profile</label>
                    <input
                      type="text"
                      name="researchgate"
                      value={formData.researchgate}
                      onChange={handleInputChange}
                      placeholder="ResearchGate profile URL"
                    />
                  </div>

                  <div className="form-group">
                    <label>Google Scholar Profile</label>
                    <input
                      type="text"
                      name="google_scholar"
                      value={formData.google_scholar}
                      onChange={handleInputChange}
                      placeholder="Google Scholar profile URL"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="info-section">
                <h2>Basic Information</h2>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{profileData.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{profileData.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">User Type:</span>
                  <span className="value user-type-badge">
                    {profileData.user_type}
                  </span>
                </div>
                {profileData.profileData?.bio && (
                  <div className="info-item">
                    <span className="label">Bio:</span>
                    <span className="value">{profileData.profileData.bio}</span>
                  </div>
                )}
              </div>

              {/* Patient-specific display */}
              {profileData.user_type === 'patient' && profileData.profileData && (
                <div className="info-section">
                  <h2>Patient Information</h2>
                  {profileData.profileData.condition && (
                    <div className="info-item">
                      <span className="label">Condition:</span>
                      <span className="value">{profileData.profileData.condition}</span>
                    </div>
                  )}
                  {profileData.profileData.age && (
                    <div className="info-item">
                      <span className="label">Age:</span>
                      <span className="value">{profileData.profileData.age}</span>
                    </div>
                  )}
                  {profileData.profileData.location && (
                    <div className="info-item">
                      <span className="label">Location:</span>
                      <span className="value">{profileData.profileData.location}</span>
                    </div>
                  )}
                  {profileData.profileData.country && (
                    <div className="info-item">
                      <span className="label">Country:</span>
                      <span className="value">{profileData.profileData.country}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Researcher-specific display */}
              {profileData.user_type === 'researcher' && profileData.profileData && (
                <div className="info-section">
                  <h2>Researcher Information</h2>
                  {profileData.profileData.institution && (
                    <div className="info-item">
                      <span className="label">Institution:</span>
                      <span className="value">{profileData.profileData.institution}</span>
                    </div>
                  )}
                  {profileData.profileData.years_experience && (
                    <div className="info-item">
                      <span className="label">Years of Experience:</span>
                      <span className="value">{profileData.profileData.years_experience}</span>
                    </div>
                  )}
                  {profileData.profileData.availability && (
                    <div className="info-item">
                      <span className="label">Availability:</span>
                      <span className={`value availability-badge ${profileData.profileData.availability}`}>
                        {profileData.profileData.availability}
                      </span>
                    </div>
                  )}
                  {profileData.profileData.orcid && (
                    <div className="info-item">
                      <span className="label">ORCID:</span>
                      <span className="value">{profileData.profileData.orcid}</span>
                    </div>
                  )}
                  {profileData.profileData.researchgate && (
                    <div className="info-item">
                      <span className="label">ResearchGate:</span>
                      <span className="value">
                        <a href={profileData.profileData.researchgate} target="_blank" rel="noopener noreferrer">
                          View Profile
                        </a>
                      </span>
                    </div>
                  )}
                  {profileData.profileData.google_scholar && (
                    <div className="info-item">
                      <span className="label">Google Scholar:</span>
                      <span className="value">
                        <a href={profileData.profileData.google_scholar} target="_blank" rel="noopener noreferrer">
                          View Profile
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="info-section">
                <h2>Account Details</h2>
                <div className="info-item">
                  <span className="label">Member Since:</span>
                  <span className="value">
                    {new Date(profileData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
