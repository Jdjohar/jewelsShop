import React, { useState, useEffect } from 'react';
import AdminNavbar from './components/AdminNavbar';
import { useNavigate } from 'react-router-dom';
//import 'bootstrap/dist/css/bootstrap.min.css';

const AddProduct = () => {
  const [staticFormData, setStaticFormData] = useState({
    name: '',
    description: '',
    CategoryName: '',
    img: null,
    featured: false,
    quantity: '', // Added quantity field for inventory
  });
  const [options, setOptions] = useState([{ key: '', value: '' }]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://jewelsshop.onrender.com/api/auth/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleStaticInputChange = (fieldName, value) => {
    setStaticFormData((prevData) => ({
      ...prevData,
      [fieldName]:
        fieldName === 'img'
          ? value.target.files[0]
          : fieldName === 'quantity'
          ? value // Keep quantity as a string until submission
          : fieldName === 'featured'
          ? value === 'true'
          : value,
    }));
  };

  const handleDynamicInputChange = (index, keyOrValue, value) => {
    const newOptions = [...options];
    newOptions[index][keyOrValue] = value;
    setOptions(newOptions);
  };

  const handleAddNew = () => {
    setOptions([...options, { key: '', value: '' }]);
  };

  const handleRemove = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', staticFormData.name);
    formData.append('description', staticFormData.description);
    formData.append('CategoryName', staticFormData.CategoryName);
    formData.append('img', staticFormData.img);
    formData.append('featured', staticFormData.featured);
    formData.append('quantity', staticFormData.quantity); // Add quantity to form data

    const opt = JSON.stringify(
      options.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value;
        return acc;
      }, {})
    );
    formData.append('options', opt);

    try {
      const response = await fetch('https://jewelsshop.onrender.com/api/auth/addproducts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert('Product added successfully!');
        console.log('Product added:', data);
        setStaticFormData({
          name: '',
          description: '',
          CategoryName: '',
          img: null,
          featured: false,
          quantity: '', // Reset quantity
        });
        setOptions([{ key: '', value: '' }]);
        document.getElementById('imgInput').value = ''; // Reset file input
        navigate('/admin/productlist');
      } else {
        console.error('API Error:', response.statusText);
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error:', error.message);
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
            <div className="col-md-10 col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Add New Product</h2>
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-bold">Product Name</label>
                      <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={staticFormData.name}
                        onChange={(e) => handleStaticInputChange('name', e.target.value)}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label fw-bold">Product Description</label>
                      <textarea
                        id="description"
                        className="form-control"
                        value={staticFormData.description}
                        onChange={(e) => handleStaticInputChange('description', e.target.value)}
                        placeholder="Enter product description"
                        rows="3"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Product Options</label>
                      {options.map((data, index) => (
                        <div key={index} className="d-flex mb-2 align-items-center">
                          <input
                            type="text"
                            placeholder="Key (e.g., Size)"
                            value={data.key}
                            onChange={(e) => handleDynamicInputChange(index, 'key', e.target.value)}
                            className="form-control me-2"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., Medium)"
                            value={data.value}
                            onChange={(e) => handleDynamicInputChange(index, 'value', e.target.value)}
                            className="form-control me-2"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemove(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm mt-2"
                        onClick={handleAddNew}
                      >
                        Add Option
                      </button>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="CategoryName" className="form-label fw-bold">Product Category</label>
                      <select
                        id="CategoryName"
                        className="form-control"
                        value={staticFormData.CategoryName}
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
                      <label htmlFor="imgInput" className="form-label fw-bold">Product Image</label>
                      <input
                        type="file"
                        id="imgInput"
                        name="img"
                        className="form-control"
                        onChange={(e) => handleStaticInputChange('img', e)}
                        accept="image/*"
                        required
                      />
                      {staticFormData.img && (
                        <small className="text-muted mt-1 d-block">
                          Selected: {staticFormData.img.name}
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="quantity" className="form-label fw-bold">Initial Inventory Quantity</label>
                      <input
                        type="number"
                        id="quantity"
                        className="form-control"
                        value={staticFormData.quantity}
                        onChange={(e) => handleStaticInputChange('quantity', e.target.value)}
                        placeholder="Enter initial stock quantity"
                        min="0"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="featured" className="form-label fw-bold">Featured Product</label>
                      <select
                        id="featured"
                        className="form-control"
                        value={staticFormData.featured}
                        onChange={(e) => handleStaticInputChange('featured', e.target.value)}
                        required
                      >
                        <option value="">Select Option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
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
                        'Add Product'
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

export default AddProduct;