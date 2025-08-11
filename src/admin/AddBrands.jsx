import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar'; // Adjust path if needed

const AddBrand = () => {
  const [brandData, setBrandData] = useState({
    name: '',
    img: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (fieldName, value) => {
    setBrandData({
      ...brandData,
      [fieldName]: fieldName === 'img' ? value.target.files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', brandData.name);
    formData.append('img', brandData.img);

    try {
      const response = await fetch('http://localhost:5000/api/auth/addbrand', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Brand added successfully');
        setBrandData({ name: '', img: null });
        document.getElementById('imgInput').value = ''; // Reset file input
      } else {
        console.error('Failed to add brand:', response.statusText);
        alert('Failed to add brand');
      }
    } catch (error) {
      console.error('Error adding brand:', error.message);
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
                  <h2 className="card-title text-center mb-4">Add New Brand</h2>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label htmlFor="brandName" className="form-label fw-bold">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        id="brandName"
                        className="form-control"
                        value={brandData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter brand name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="imgInput" className="form-label fw-bold">
                        Brand Logo (Optional)
                      </label>
                      <input
                        type="file"
                        id="imgInput"
                        name="img"
                        className="form-control"
                        onChange={(e) => handleInputChange('img', e)}
                        accept="image/*"
                      />
                      {brandData.img && (
                        <small className="text-muted">
                          Selected: {brandData.img.name}
                        </small>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success w-100"
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
                        'Add Brand'
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

export default AddBrand;
