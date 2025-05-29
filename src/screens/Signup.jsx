import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';

export default function Signup() {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", role: "user" });
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    const navLocation = () =>
      new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));

    try {
      const latlong = await navLocation().then(res => {
        const { latitude, longitude } = res.coords;
        return [latitude, longitude];
      });

      const [lat, long] = latlong;
      const response = await fetch("https://jewelsshop.onrender.com/api/auth/getlocation", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latlong: { lat, long } }),
      });

      const { location } = await response.json();
      setAddress(location);
      setCredentials({ ...credentials, geolocation: location });
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://jewelsshop.onrender.com/api/auth/createuser", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        location: credentials.geolocation,
      }),
    });

    const json = await response.json();
    if (json.success) {
      localStorage.setItem('token', json.authToken);
      navigate("/login");
    } else {
      alert("Enter Valid Credentials");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Navbar2 />

      <div className="container py-5">
        <div className="row py-5 g-0 h-100">
          {/* Left Side - Promotional Section */}
          <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center">
            <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
              Join Our Turban Family!
            </h1>
            <p className="mb-5" style={{ fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center' }}>
              Sign up to explore a wide variety of turbans, receive exclusive offers, and embrace your identity with tradition and style.
            </p>
          </div>

          {/* Right Side - Signup Form */}
          <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
            <div className="w-100" style={{ maxWidth: '400px' }}>
              <h2 className="fw-bold mb-2">Create Account</h2>
              <p className="text-muted mb-4">Sign up to get started</p>

              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label text-muted">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={credentials.name}
                    onChange={onChange}
                    placeholder="Your full name"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-muted">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={credentials.email}
                    onChange={onChange}
                    placeholder="Email address"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                </div>

                {/* Address Field */}
                {/* <div className="mb-3">
                  <label htmlFor="address" className="form-label text-muted">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Click below to fetch current location"
                    style={{ borderRadius: '10px', padding: '12px' }}
                    readOnly
                  />
                </div> */}

                {/* Location Button */}
                <div className="mb-3 text-end">
                  <button
                    type="button"
                    onClick={handleClick}
                    name="geolocation"
                    className="btn btn-outline-primary"
                    style={{ borderRadius: '10px' }}
                  >
                    Fetch Current Location
                  </button>
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-muted">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={credentials.password}
                    onChange={onChange}
                    placeholder="Password"
                    required
                    style={{ borderRadius: '10px', padding: '12px' }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{ backgroundColor: '#1e3a8a', borderRadius: '10px', padding: '12px' }}
                >
                  Sign Up
                </button>
              </form>

              {/* Already have an account */}
              <p className="text-center text-muted mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary text-decoration-none">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
