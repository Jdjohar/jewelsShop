import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar2 from '../components/Navbar2'; // Consistent with Login.jsx

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.resetToken) {
        setMessage('Email Sent! Please check your inbox to reset your password.');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar2 />

      <div className="container py-5">
        <div className="row py-5 g-0 h-100">
          {/* Left Side - Informative Section */}
          <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center">
            <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
              Forgot Your Password?
            </h1>
            <p className="mb-5" style={{ fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center' }}>
              Enter your registered email address to receive a password reset link and regain access to your account.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
            <div className="w-100" style={{ maxWidth: '400px' }}>
              <h2 className="fw-bold mb-2">Reset Password</h2>
              <p className="text-muted mb-4">We’ll send a reset link to your email</p>

              {/* Success / Error Message */}
              {message && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')} aria-label="Close"></button>
                </div>
              )}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-muted">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{ backgroundColor: '#1e3a8a', borderRadius: '10px', padding: '12px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <p className="text-center text-muted mt-4">
                Remember your password?{' '}
                <Link to="/login" className="text-primary text-decoration-none">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
