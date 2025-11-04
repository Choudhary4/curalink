import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrcidCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('ORCID authentication failed');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store token
        localStorage.setItem('token', token);

        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('user', JSON.stringify({
          email: payload.email,
          userType: payload.userType
        }));

        setStatus('success');

        // Redirect to profile page
        setTimeout(() => {
          navigate('/profile');
        }, 1500);

      } catch (error) {
        console.error('ORCID callback error:', error);
        setError('Failed to process ORCID authentication');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #00897b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ color: '#333', marginBottom: '12px' }}>
              Connecting with ORCID...
            </h2>
            <p style={{ color: '#666' }}>
              Please wait while we set up your account
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#4caf50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'white',
              fontSize: '32px'
            }}>
              ✓
            </div>
            <h2 style={{ color: '#333', marginBottom: '12px' }}>
              Successfully Authenticated!
            </h2>
            <p style={{ color: '#666' }}>
              Redirecting to your profile...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#f44336',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'white',
              fontSize: '32px'
            }}>
              ✕
            </div>
            <h2 style={{ color: '#333', marginBottom: '12px' }}>
              Authentication Failed
            </h2>
            <p style={{ color: '#666' }}>
              {error || 'An error occurred during authentication'}
            </p>
            <p style={{ color: '#999', fontSize: '14px', marginTop: '12px' }}>
              Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OrcidCallback;
