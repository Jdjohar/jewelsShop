import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet';
import ShimmerCard from '../components/ShimmerCard'
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const searchTerm = query.get("q"); // From Navbar.jsx
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setError("Please enter a search term.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://jewelsshop.onrender.com/api/auth/products/search?name=${encodeURIComponent(searchTerm)}`, {
          headers: {
            'Content-Type': 'application/json',
            // Uncomment if authentication is required
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          // Transform options array to object for Card compatibility
          const transformedResults = (data.data || []).map(item => ({
            ...item,
            options: Array.isArray(item.options)
              ? item.options.reduce((acc, opt) => {
                if (opt.size && opt.price) {
                  acc[opt.size] = opt.price.toString();
                }
                return acc;
              }, {})
              : { "default": "10" } // Fallback if options is undefined or empty
          }));
          setResults(transformedResults);
        } else {
          setError(data.message || 'No products found.');
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setError("Failed to fetch search results. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <div>
      <Helmet>
        <title>{searchTerm || ''} | Trezoar</title>
      </Helmet>
      <Navbar />
     <div className="container mt-5 pt-5">
  <h3>Search Results for "{searchTerm || ''}"</h3>
  
  {loading && (
    <div className="row">
      {Array(8).fill().map((_, i) => (
        <div key={i} className="col-6 col-md-6 col-lg-3 mb-4">
          <ShimmerCard />
        </div>
      ))}
    </div>
  )}

  {error && <p className="text-danger">{error}</p>}

  {!loading && !error && results.length === 0 && (
    <p>No products found matching "{searchTerm}".</p>
  )}

  {!loading && !error && results.length > 0 && (
    <div className="row">
      {results.map((item) => (
        <div key={item._id} className="col-6 col-md-6 col-lg-3 mb-4">
          <Card
            foodName={item.name}
            CategoryName={item.CategoryName}
            item={item}
            options={item.options}
            ImgSrc={item.img}
          />
        </div>
      ))}
    </div>
  )}
</div>


      <Footer />
    </div>

  );
};

export default SearchResults;