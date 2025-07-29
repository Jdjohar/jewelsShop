import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For show/hide password icons
import Navbar from '../components/Navbar';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic form validation
    if (!credentials.email || !credentials.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://jewelsshop.onrender.com/api/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();
      console.log(json);

      if (json.success) {
        // Save the auth token and user details to localStorage
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('token', json.authToken);
        localStorage.setItem('userId', json.userId);

        // Redirect based on the role
        if (json.role === 'user') {
          navigate("/");
        } else if (json.role === 'admin') {
          navigate("/admin/dashboard");
        }
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <Navbar />

      <div className="container py-5">
        <div className="row py-5 g-0 h-100">
          {/* Left Side - Promotional Section */}
          <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center">
            <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
              Your Turban, Your Identity!
            </h1>
            <p className=" mb-5" style={{ fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center' }}>
              Sign in to access your account, track orders, and shop the finest turbans in vibrant colors and premium fabrics. Stay connected to tradition with ease.
            </p>

          </div>

          {/* Right Side - Login Form */}
          <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
            <div className="w-100" style={{ maxWidth: '400px' }}>
              {/* Logo and Brand Name */}


              {/* Welcome Text */}
              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-muted mb-4">Please login to your account</p>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-muted">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={onChange}
                    placeholder="Email address"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                </div>

                {/* Password Field */}
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label text-muted">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={onChange}
                    placeholder="Password"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                  <span
                    onClick={toggleShowPassword}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: '#666',
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Forgot Password Link */}
                <div className="mb-4 text-end">
                  <Link to="/forgotpassword" className="text-primary text-decoration-none">
                    Forget Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{ backgroundColor: '#1e3a8a', borderRadius: '10px', padding: '12px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              {/* <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">OR LOGIN WITH</span>
                <hr className="flex-grow-1" />
              </div> */}

              {/* Social Login Buttons */}
              {/* <div className="d-flex justify-content-between mb-4">
                <button
                  className="btn btn-outline-secondary w-100 me-2"
                  style={{ borderRadius: '10px', padding: '10px' }}
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    style={{ width: '20px', marginRight: '8px' }}
                  />
                  Google
                </button>
                <button
                  className="btn btn-outline-secondary w-100 ms-2"
                  style={{ borderRadius: '10px', padding: '10px' }}
                >
                  <img
                    src="https://www.facebook.com/favicon.ico"
                    alt="Facebook"
                    style={{ width: '20px', marginRight: '8px' }}
                  />
                  Facebook
                </button>
              </div> */}

              {/* Sign Up Link */}
              <p className="text-center text-muted">
                Don’t have an account?{' '}
                <Link to="/signup" className="text-primary text-decoration-none">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}