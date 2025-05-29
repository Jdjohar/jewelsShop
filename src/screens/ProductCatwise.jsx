import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar2';

const ProductCatwise = () => {
    const { categoryName } = useParams();
    const [foodItems, setFoodItems] = useState([]); // Original product list
    const [foodCat, setFoodCat] = useState([]); // Category list
    const [filteredProducts, setFilteredProducts] = useState([]); // Filtered product list
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [minPrice, setMinPrice] = useState(''); // Empty string to allow clearing
    const [maxPrice, setMaxPrice] = useState(''); // Empty string to allow clearing
    const [categoryFilters, setCategoryFilters] = useState({});

    // Fetch food items and categories
    useEffect(() => {
        const loadFoodItems = async () => {
            try {
                let response = await fetch('https://jewelsshop.onrender.com/api/auth/foodData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                response = await response.json();
                setFoodItems(response[0]);
                setFoodCat(response[1]);

                // Initialize filtered products
                const initialFiltered = categoryName
                    ? response[0].filter((item) => item.CategoryName.toLowerCase() === categoryName.toLowerCase())
                    : response[0];
                setFilteredProducts(initialFiltered);

                // Initialize category filters
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

    // Set dynamic page title
    useEffect(() => {
        if (categoryName) {
            const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            document.title = ` Jewels Shop | ${formattedCategory}`;
        } else {
            document.title = ' Jewels Shop | All Products';
        }
    }, [categoryName]);

    // Apply filters (price and category)
    useEffect(() => {
        let updatedProducts = foodItems;

        // Apply category filter
        if (Object.values(categoryFilters).some((checked) => checked)) {
            const selectedCategories = Object.keys(categoryFilters).filter((cat) => categoryFilters[cat]);
            console.log('Selected categories:', selectedCategories);
            updatedProducts = foodItems.filter((item) =>
                selectedCategories.includes(item.CategoryName.toLowerCase())
            );
        }

        // Apply price filter
        const min = minPrice === '' ? 0 : parseFloat(minPrice) || 0;
        const max = maxPrice === '' ? Infinity : parseFloat(maxPrice) || Infinity;
        console.log(`Applying price filter: min=${min}, max=${max}`);

        const filtered = updatedProducts.filter((product) => {
            const price = parseFloat(product.options?.[0]?.price || 0);
            console.log(`Product: ${product.name}, Price: ${price}, In range: ${price >= min && price <= max}`);
            return price >= min && price <= max;
        });

        setFilteredProducts(filtered);
    }, [minPrice, maxPrice, foodItems, categoryFilters]);

    // Handle category checkbox change
    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        console.log(`Category ${value} checked: ${checked}`);
        setCategoryFilters((prev) => ({
            ...prev,
            [value.toLowerCase()]: checked,
        }));
    };

    // Handle price input changes with validation
    const handleMinPriceChange = (value) => {
        setMinPrice(value);
        console.log(value, "MinPrice");
        
        if (value !== '' && maxPrice !== '' && parseFloat(value) > parseFloat(maxPrice)) {
            setMaxPrice(value); // Ensure min <= max
        }
    };

    const handleMaxPriceChange = (value) => {
        console.log(value, "MaxPrice");
        setMaxPrice(value);
        if (value !== '' && minPrice !== '' && parseFloat(value) < parseFloat(minPrice)) {
            setMinPrice(value); // Ensure max >= min
        }
    };

    return (
        <div>
            <Navbar />
            {/* Page Header */}
            <section className="page-header py-5 bg-primary text-white mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="display-4 fw-bold text-white" id="categoryTitle">
                                {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'All Products'}
                            </h1>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="../index.html" className="text-white text-decoration-none">Home</a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a href="categories.html" className="text-white text-decoration-none">Categories</a>
                                    </li>
                                    <li className="breadcrumb-item active text-white-50" aria-current="page" id="breadcrumbCategory">
                                        {categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : 'All Products'}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row">
                        {/* Filters Sidebar */}
                        <div className="col-lg-3 mb-4 mb-lg-0">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-4">Filters</h4>
                                    {/* Categories Filter */}
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
                                    {/* Price Range Filter */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Price Range</h6>
                                        <div className="d-flex justify-content-between">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min"
                                                    id="minPrice"
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
                                                    id="maxPrice"
                                                    value={maxPrice}
                                                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Customer Ratings */}
                                   
                                    {/* Availability Filter */}
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Availability</h6>
                                        <div className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value="instock"
                                                id="instockCheck"
                                                defaultChecked
                                            />
                                            <label className="form-check-label" htmlFor="instockCheck">
                                                In Stock
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value="sale"
                                                id="saleCheck"
                                            />
                                            <label className="form-check-label" htmlFor="saleCheck">
                                                On Sale
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Products Grid */}
                        <div className="col-lg-9">
                            {/* Sort and View Options */}
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
                                            id="gridViewBtn"
                                        >
                                            <i className="bi bi-grid-3x3-gap-fill"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                                            onClick={() => setViewMode('list')}
                                            id="listViewBtn"
                                        >
                                            <i className="bi bi-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Products Grid View */}
                            <div className={`row g-4 ${viewMode === 'list' ? 'list-view' : ''}`} id="productsGrid">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className={viewMode === 'grid' ? 'col-lg-4 col-md-6' : 'col-12 mb-3'}
                                        >
                                            <Card
                                                item={product}
                                                options={product.options[0]}
                                                foodName={product.name}
                                                ImgSrc={product.img}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p>No products available in this category.</p>
                                )}
                            </div>
                            {/* Pagination */}
                            <nav aria-label="Product pagination" className="mt-5">
                                <ul className="pagination justify-content-center">
                                    <li className="page-item disabled">
                                        <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">Previous</a>
                                    </li>
                                    <li className="page-item active"><a className="page-link" href="#">1</a></li>
                                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
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