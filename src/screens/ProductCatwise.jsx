import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar2';
import { Helmet } from 'react-helmet';

const ProductCatwise = () => {
    const { categoryName } = useParams();
    const [foodItems, setFoodItems] = useState([]);
    const [foodCat, setFoodCat] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categoryFilters, setCategoryFilters] = useState({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadFoodItems = async () => {
            try {
                let response = await fetch('https://jewelsshop.onrender.com/api/auth/foodData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                response = await response.json();
                setFoodItems(response[0]);
                setFoodCat(response[1]);

                const initialFiltered = categoryName
                    ? response[0].filter((item) => item.CategoryName.toLowerCase() === categoryName.toLowerCase())
                    : response[0];
                setFilteredProducts(initialFiltered);

                const initialFilters = {};
                response[1].forEach((cat) => {
                    initialFilters[cat.CategoryName.toLowerCase()] = categoryName
                        ? cat.CategoryName.toLowerCase() === categoryName.toLowerCase()
                        : false;
                });
                setCategoryFilters(initialFilters);
            } catch (error) {
                console.error('Error fetching food data:', error.message);
            }
        };
        loadFoodItems();
    }, [categoryName]);

    useEffect(() => {
        if (categoryName) {
            const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            document.title = `Store name | ${formattedCategory}`;
        } else {
            document.title = 'Store name | All Products';
        }
    }, [categoryName]);

    useEffect(() => {
        let updatedProducts = foodItems;

        if (Object.values(categoryFilters).some((checked) => checked)) {
            const selectedCategories = Object.keys(categoryFilters).filter((cat) => categoryFilters[cat]);
            updatedProducts = foodItems.filter((item) =>
                selectedCategories.includes(item.CategoryName.toLowerCase())
            );
        }

        const min = minPrice === '' ? 0 : parseFloat(minPrice) || 0;
        const max = maxPrice === '' ? Infinity : parseFloat(maxPrice) || Infinity;

        const filtered = updatedProducts.filter((product) => {
            let price = 0;
            try {
                if (Array.isArray(product.options) && product.options.length > 0) {
                    const firstOption = product.options[0];
                    const priceValue = Object.values(firstOption)[0];
                    price = parseFloat(priceValue || 0);
                }
            } catch (err) {
                console.warn('Error parsing product price:', err);
            }
            // console.log(product.name, product.options, "chellsdsdsd");
            return price >= min && price <= max;
        });

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page after filters apply
    }, [minPrice, maxPrice, foodItems, categoryFilters]);

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setCategoryFilters((prev) => ({
            ...prev,
            [value.toLowerCase()]: checked,
        }));
    };

    const handleMinPriceChange = (value) => {
        setMinPrice(value);
        if (value !== '' && maxPrice !== '' && parseFloat(value) > parseFloat(maxPrice)) {
            setMaxPrice(value);
        }
    };

    const handleMaxPriceChange = (value) => {
        setMaxPrice(value);
        if (value !== '' && minPrice !== '' && parseFloat(value) < parseFloat(minPrice)) {
            setMinPrice(value);
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div>
            <Helmet>
                <title>{categoryName} | Australia | Store name</title>
            </Helmet>
            <Navbar />

            <section className="page-header py-5 bg-primary text-white mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="display-4 fw-bold text-white">
                                {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'All Products'}
                            </h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="/" className="text-white text-decoration-none">Home</a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a href="/categories" className="text-white text-decoration-none">Categories</a>
                                    </li>
                                    <li className="breadcrumb-item active text-white-50" aria-current="page">
                                        {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'All Products'}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="row">
                        {/* Filters */}
                        <div className="col-lg-3 mb-4 mb-lg-0">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-4">Filters</h4>
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Categories</h6>
                                        {foodCat.map((cat) => (
                                            <div className="form-check mb-2" key={cat.CategoryName}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    value={cat.CategoryName}
                                                    id={`${cat.CategoryName.toLowerCase()}Check`}
                                                    checked={categoryFilters[cat.CategoryName.toLowerCase()] || false}
                                                    onChange={handleCategoryChange}
                                                />
                                                <label className="form-check-label" htmlFor={`${cat.CategoryName.toLowerCase()}Check`}>
                                                    {cat.CategoryName}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Price Range</h6>
                                        <div className="d-flex justify-content-between">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => handleMinPriceChange(e.target.value)}
                                                />
                                            </div>
                                            <div className="mx-2">-</div>
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="col-lg-9">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <label className="me-2">Sort by:</label>
                                    <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                                        <option defaultValue>Popularity</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest First</option>
                                        <option>Customer Rating</option>
                                    </select>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="me-3 d-none d-sm-inline">View:</span>
                                    <div className="btn-group" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary ${viewMode === 'grid' ? 'active' : ''}`}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <i className="bi bi-grid-3x3-gap-fill"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                                            onClick={() => setViewMode('list')}
                                        >
                                            <i className="bi bi-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={`row g-4 ${viewMode === 'list' ? 'list-view' : ''}`}>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className={viewMode === 'grid' ? 'col-lg-4 col-md-6' : 'col-12 mb-3'}
                                        >
                                            <Card
                                                item={product}
                                                options={product.options[0]}
                                                foodName={product.name}
                                                ImgSrc={product.img}
                                                  slug={product.slug}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p>No products available in this category.</p>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            <nav aria-label="Page navigation" className="mt-5">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default ProductCatwise;
