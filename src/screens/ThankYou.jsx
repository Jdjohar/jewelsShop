import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Import CSS file for styling

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Navigate to home page
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, [navigate]);

  const handleBackToHome = () => {
    navigate('/'); // Navigate immediately
  };

  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <div className="thank-you-header">
          <h1>Thank You for Your Purchase!</h1>
          <p className="thank-you-subtext">
            We’re thrilled to have you with us! You’ll be redirected to the homepage in 10 seconds.
          </p>
        </div>
        <div className="svg-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#28a745" // Brand color (e.g., green for success)
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-check-circle animate-check"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="16 12 12 8 8 12"></polyline>
          </svg>
        </div>
        <button className="back-to-home-button" onClick={handleBackToHome}>
          Back to Home Now
        </button>
      </div>
    </div>
  );
};

export default ThankYou;