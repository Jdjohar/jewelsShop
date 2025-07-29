import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 6;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://jewelsshop.onrender.com/api/auth/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        setBrands(data.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
        alert('Failed to load brands');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const response = await fetch(`https://jewelsshop.onrender.com/api/auth/brand/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updated = brands.filter((brand) => brand._id !== id);
          setBrands(updated);
          alert('Brand deleted successfully');

          const filtered = updated.filter((brand) =>
            brand.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (Math.ceil(filtered.length / brandsPerPage) < currentPage) {
            setCurrentPage(1);
          }
        } else {
          alert('Error deleting brand');
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand');
      }
    }
  };

  // Filter and paginate
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
  const indexOfLast = currentPage * brandsPerPage;
  const indexOfFirst = indexOfLast - brandsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <h2 className="mb-4">Brand List</h2>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search brands by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <p className="text-center text-muted">
              {searchTerm ? 'No brands match your search.' : 'No brands found.'}
            </p>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentBrands.map((brand) => (
                  <div key={brand._id} className="col">
                    <div className="card h-100 shadow-sm border-0">
                      <img
                        src={brand.img || 'https://via.placeholder.com/150?text=No+Logo'}
                        alt={brand.name}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'contain', padding: '1rem' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=No+Logo')}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{brand.name}</h5>
                      </div>
                      <div className="card-footer bg-transparent border-0">
                        <Link
                          to={`/admin/brandEdit/${brand._id}`}
                          className="btn btn-outline-warning btn-sm me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(brand._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Brand pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandList;
