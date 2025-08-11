import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
//import 'bootstrap/dist/css/bootstrap.min.css';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState({
    CategoryName: '',
    img: '',
  });
  const [file, setFile] = useState(null); // For new image upload
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/auth/categories/${id}`);
        const result = await response.json();

        if (result.status === 'success' || result.data) { // Adjust based on your API response
          setCategoryData({
            CategoryName: result.data.CategoryName || '',
            img: result.data.img || '',
          });
        } else {
          console.error('Error fetching category:', result.message);
          alert('Failed to load category');
        }
      } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCategoryData((prev) => ({ ...prev, [field]: value }));
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
    formData.append('CategoryName', categoryData.CategoryName);
    if (file) formData.append('img', file);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/categories/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Category updated successfully!');
        navigate('/admin/categoryList'); // Redirect to category list
      } else {
        const errorData = await response.json();
        console.error('Error updating category:', errorData.message);
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error.message);
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
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h2 className="card-title text-center mb-4">Edit Category</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="mb-3">
                        <label htmlFor="CategoryName" className="form-label fw-bold">Category Name</label>
                        <input
                          type="text"
                          id="CategoryName"
                          className="form-control"
                          value={categoryData.CategoryName}
                          onChange={(e) => handleInputChange('CategoryName', e.target.value)}
                          placeholder="Enter category name"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="img" className="form-label fw-bold">Category Image</label>
                        {categoryData.img && !file && (
                          <div className="mb-2">
                            <img
                              src={categoryData.img}
                              alt={categoryData.CategoryName}
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

export default CategoryEdit;