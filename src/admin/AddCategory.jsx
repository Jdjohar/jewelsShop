import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar'; // Assuming this is in the same components folder


const AddCategory = () => {
  const [categoryData, setCategoryData] = useState({
    categoryName: '',
    img: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (fieldName, value) => {
    setCategoryData({
      ...categoryData,
      [fieldName]: fieldName === 'img' ? value.target.files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('CategoryName', categoryData.categoryName);
    formData.append('img', categoryData.img);

    try {
      const response = await fetch('https://jewelsshop.onrender.com/api/auth/addcategory', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Category added successfully');
        setCategoryData({ categoryName: '', img: null });
        document.getElementById('imgInput').value = ''; // Reset file input
      } else {
        console.error('Failed to add category:', response.statusText);
        alert('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error.message);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ marginLeft: '250px', padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Add New Category</h2>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label htmlFor="categoryName" className="form-label fw-bold">
                        Category Name
                      </label>
                      <input
                        type="text"
                        id="categoryName"
                        className="form-control"
                        value={categoryData.categoryName}
                        onChange={(e) => handleInputChange('categoryName', e.target.value)}
                        placeholder="Enter category name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="imgInput" className="form-label fw-bold">
                        Category Image
                      </label>
                      <input
                        type="file"
                        id="imgInput"
                        name="img"
                        className="form-control"
                        onChange={(e) => handleInputChange('img', e)}
                        accept="image/*"
                        required
                      />
                      {categoryData.img && (
                        <small className="text-muted">
                          Selected: {categoryData.img.name}
                        </small>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding...
                        </>
                      ) : (
                        'Add Category'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCategory;