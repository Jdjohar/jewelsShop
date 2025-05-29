import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://jewelsshop.onrender.com/api/auth/product');
        const result = await response.json();

        if (result.status === 'success') {
          setProducts(result.data);
        } else {
          console.error('Error fetching products:', result.message);
          alert('Failed to load products');
        }
      } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred while fetching products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://jewelsshop.onrender.com/api/auth/product/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== id));
        console.log('Product deleted successfully');
        const filtered = products.filter((product) => product._id !== id).filter((product) =>
          (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.CategoryName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        if (Math.ceil(filtered.length / productsPerPage) < currentPage) {
          setCurrentPage(1);
        }
      } else {
        console.error('Failed to delete product:', response.statusText);
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error.message);
      alert('An error occurred');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/editProduct/${id}`);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <h2 className="mb-4">Product List</h2>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by product name or category..."
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
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-muted">
              {searchTerm ? 'No products match your search.' : 'No products found.'}
            </p>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentProducts.map((product) => (
                  <div key={product._id} className="col">
                    <div className="card h-100 shadow-sm border-0">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=No+Image')}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text text-muted">{product.CategoryName}</p>
                        <p className="card-text">
                          {product.description ? product.description.substring(0, 50) + '...' : 'No description'}
                        </p>
                        <div className="options-badges">
                          {product.options && product.options[0] ? (
                            Object.entries(product.options[0]).map(([key, value]) => (
                              <span key={key} className="badge bg-secondary me-1 mb-1">
                                {key}: ${value}
                              </span>
                            ))
                          ) : (
                            <small className="text-muted">No options</small>
                          )}
                        </div>
                        <small className="text-muted d-block mt-2">
                          Featured: {product.featured ? 'Yes' : 'No'}
                        </small>
                        <small className="text-muted d-block mt-2">
                          Featured: {product.inventory.quantity}
                        </small>
                      </div>
                      <div className="card-footer bg-transparent border-0">
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleEdit(product._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <nav aria-label="Product pagination" className="mt-4">
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

export default ProductList;