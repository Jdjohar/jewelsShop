import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const categoriesPerPage = 6; // Number of categories per page

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter((category) => category._id !== id));
          alert('Category deleted successfully');
          // Reset to page 1 if the current page becomes empty
          const filtered = categories.filter((category) => category._id !== id).filter((category) =>
            category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (Math.ceil(filtered.length / categoriesPerPage) < currentPage) {
            setCurrentPage(1);
          }
        } else {
          alert('Error deleting category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination details
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <h2 className="mb-4">Category List</h2>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search categories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <p className="text-center text-muted">
              {searchTerm ? 'No categories match your search.' : 'No categories found.'}
            </p>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentCategories.map((category) => (
                  <div key={category._id} className="col">
                    <div className="card h-100 shadow-sm border-0">
                      <img
                        src={category.img}
                        alt={category.CategoryName}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=No+Image')}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{category.CategoryName}</h5>
                      </div>
                      <div className="card-footer bg-transparent border-0">
                        <Link
                          to={`/admin/categoryEdit/${category._id}`}
                          className="btn btn-outline-warning btn-sm me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Category pagination" className="mt-4">
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

export default CategoryList;