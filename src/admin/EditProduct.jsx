import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    CategoryName: '',
    options: {}, // Object for key-value pairs
    img: '',
  });
  const [file, setFile] = useState(null); // For new image upload
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit

  // Fetch categories and product data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/categories');
        const result = await response.json();
        if (result.data) setCategories(result.data);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/auth/product/${id}`);
        const result = await response.json();

        if (result.status === 'success') {
          const combinedOptions = result.data.options && result.data.options.length > 0
            ? result.data.options.reduce((acc, option) => ({ ...acc, ...option }), {})
            : {};
          setProductData({
            name: result.data.name || '',
            description: result.data.description || '',
            CategoryName: result.data.CategoryName || '',
            options: combinedOptions,
            img: result.data.img || '',
          });
        } else {
          console.error('Error fetching product:', result.message);
          alert('Failed to load product');
        }
      } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  // Handle static input changes
  const handleStaticInputChange = (field, value) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle dynamic options input changes
  const handleDynamicInputChange = (oldKey, newKey, newValue) => {
    setProductData((prev) => {
      const updatedOptions = { ...prev.options };
      if (oldKey !== newKey && newKey) {
        delete updatedOptions[oldKey];
        updatedOptions[newKey] = newValue;
      } else {
        updatedOptions[oldKey] = newValue;
      }
      return { ...prev, options: updatedOptions };
    });
  };

  // Add new option field
  const handleAddNewOption = () => {
    setProductData((prev) => ({
      ...prev,
      options: { ...prev.options, '': '' },
    }));
  };

  // Remove option field
  const handleRemoveOption = (key) => {
    setProductData((prev) => {
      const updatedOptions = { ...prev.options };
      delete updatedOptions[key];
      return { ...prev, options: updatedOptions };
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('CategoryName', productData.CategoryName);
    if (file) formData.append('img', file);
    formData.append('options', JSON.stringify([productData.options])); // Wrap in array for consistency

    try {
      const response = await fetch(`http://localhost:5000/api/auth/product/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Product updated successfully!');
        navigate('/admin/productlist'); // Redirect to product list
      } else {
        const errorData = await response.json();
        console.error('Error updating product:', errorData.message);
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error.message);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-md-10 col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h2 className="card-title text-center mb-4">Edit Product</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label fw-bold">Product Name</label>
                        <input
                          type="text"
                          id="name"
                          className="form-control"
                          value={productData.name}
                          onChange={(e) => handleStaticInputChange('name', e.target.value)}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label fw-bold">Description</label>
                        <textarea
                          id="description"
                          className="form-control"
                          value={productData.description}
                          onChange={(e) => handleStaticInputChange('description', e.target.value)}
                          placeholder="Enter product description"
                          rows="3"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Product Options</label>
                        {Object.entries(productData.options).map(([key, value], index) => (
                          <div key={index} className="d-flex mb-2 align-items-center">
                            <input
                              type="text"
                              placeholder="Key (e.g., Size)"
                              className="form-control me-2"
                              value={key}
                              onChange={(e) => handleDynamicInputChange(key, e.target.value, value)}
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g., $20)"
                              className="form-control me-2"
                              value={value}
                              onChange={(e) => handleDynamicInputChange(key, key, e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveOption(key)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm mt-2"
                          onClick={handleAddNewOption}
                        >
                          Add Option
                        </button>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="CategoryName" className="form-label fw-bold">Category</label>
                        <select
                          id="CategoryName"
                          className="form-control"
                          value={productData.CategoryName}
                          onChange={(e) => handleStaticInputChange('CategoryName', e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category.CategoryName}>
                              {category.CategoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="img" className="form-label fw-bold">Product Image</label>
                        {productData.img && !file && (
                          <div className="mb-2">
                            <img
                              src={productData.img}
                              alt={productData.name}
                              className="img-fluid rounded"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          id="img"
                          className="form-control"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        {file && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: '150px' }}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditProduct;