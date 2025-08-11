import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';

const BrandEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brandData, setBrandData] = useState({
    name: '',
    img: '',
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBrand = async () => {
        console.log("result3");
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/auth/brand/${id}`);
        const result = await response.json();
console.log(result,"result");

        if (result.status === 'success' || result.data) {
          setBrandData({
            name: result.data.name || '',
            img: result.data.img || '',
          });
        } else {
          console.error('Error fetching brand:', result.message);
          alert('Failed to load brand');
        }
      } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred while fetching the brand');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  const handleInputChange = (field, value) => {
    setBrandData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', brandData.name);
    if (file) formData.append('img', file);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/brand/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Brand updated successfully!');
        navigate('/admin/brandList');
      } else {
        const errorData = await response.json();
        console.error('Error updating brand:', errorData.message);
        alert('Failed to update brand');
      }
    } catch (error) {
      console.error('Error updating brand:', error.message);
      alert('An error occurred while updating the brand');
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
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h2 className="card-title text-center mb-4">Edit Brand</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="mb-3">
                        <label htmlFor="brandName" className="form-label fw-bold">Brand Name</label>
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
                        <label htmlFor="img" className="form-label fw-bold">Brand Logo</label>
                        {brandData.img && !file && (
                          <div className="mb-2">
                            <img
                              src={brandData.img}
                              alt={brandData.name}
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
                        className="btn btn-success w-100"
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

export default BrandEdit;
