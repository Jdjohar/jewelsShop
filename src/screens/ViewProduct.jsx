import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useDispatchCart, useCart } from '../components/ContextReducer';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

const ViewProduct = () => {
    const { slug } = useParams(); // ✅ Only slug is needed
    const [product, setProduct] = useState(null);
    const dispatch = useDispatchCart();
    const cart = useCart();
    const [selectedQty, setSelectedQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [price, setPrice] = useState(0);

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        if (product?.options?.length > 0) {
            const selectedOption = product.options[0][size];
            setPrice(Number(selectedOption));
        }
    };

    const addToCart = () => {
        const existingItem = cart.find(
            (item) => item.id === product._id && item.size === selectedSize
        );

        if (existingItem) {
            dispatch({
                type: 'UPDATE',
                id: product._id,
                qty: selectedQty,
                size: selectedSize,
            });
             toast.success("Product Removed from your cart!");
        } else {
            dispatch({
                type: 'ADD',
                id: product._id,
                name: product.name,
                qty: selectedQty,
                size: selectedSize,
                price: price * selectedQty,
                img: product.img,
            });
            toast.success("Product added to your cart!");
        }
    };

    const removeFromCart = () => {
        dispatch({
            type: 'REMOVE',
            id: product._id,
            size: selectedSize,
        });
         toast.info("Product removed from your cart.");
    };

    useEffect(() => {
        console.log(slug, "CAll fesddstch");
        const fetchProduct = async () => {
            console.log("CAll fetch");
            try {
                const response = await fetch(`http://localhost:5000/api/auth/product/slug/${slug}`);
                const data = await response.json();
                console.log(data, "CAll");
                if (response.status === 200) {
                    console.log(data, "in IF");

                    setProduct(data); // ✅ Use `data` not `data.data`
                    if (data.options?.length > 0) {
                        const firstSize = Object.keys(data.options[0])[0];
                        setSelectedSize(firstSize);
                        setPrice(Number(data.options[0][firstSize]));
                    }
                } else {
                    console.error('Failed to fetch product:', data.message);
                }
            } catch (error) {
                console.error('Error fetching product:', error.message);
            }
        };
        console.log(slug, "slug");

        if (slug) fetchProduct(); // ✅ Only run if slug exists
    }, [slug]);

    return (
        <div>
            <Helmet>
                <title>{product ? `${product.name} | My Store` : 'Loading...'}</title>
            </Helmet>

            <Navbar />
            {/* Breadcrumbs */}
            <section className="page-header mt-5 py-4 bg-light border-bottom">
                <div className="container mt-4">
                    <div className="row align-items-center">
                        <div className="col-md-12">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="/" className="text-decoration-none text-muted">Home</a>
                                    </li>
                                    {product?.CategoryName && (
                                        <li className="breadcrumb-item">
                                            <a
                                                href={`/products/${product.CategoryName.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="text-decoration-none text-muted"
                                            >
                                                {product.CategoryName}
                                            </a>
                                        </li>
                                    )}

                                    <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
                                        {product?.name || 'Product'}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-1">
                <div className="container py-5">
                    {product && (
                        <div className="row pt-5">
                            <div className="col-lg-6 mb-4">
                                <img src={product.img} alt={product.name} className="img-fluid rounded" />
                            </div>

                            <div className="col-lg-6">
                                <h1 className="mb-2">{product.name}</h1>
                                <div className="mb-3">
                                    <span className="fs-3 text-danger">${price.toFixed(2)}</span>
                                </div>
                                <p>{product.description}</p>

                                <div className="mb-3">
                                    <label className="form-label">Size</label>
                                    <div>
                                        {product.options &&
                                            Object.keys(product.options[0]).map((size) => (
                                                <button
                                                    key={size}
                                                    className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'
                                                        } me-2`}
                                                    onClick={() => handleSizeChange(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="quantity" className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="quantity"
                                        style={{ width: '100px' }}
                                        min="1"
                                        value={selectedQty}
                                        onChange={(e) => setSelectedQty(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button className="btn btn-primary" onClick={addToCart}>
                                        <i className="bi bi-cart-plus me-2"></i> Add to Cart
                                    </button>

                                    {cart.some(item => item.id === product._id && item.size === selectedSize) ? (
                                        <button className="btn btn-danger" onClick={removeFromCart}>
                                            <i className="bi bi-trash me-2"></i> Remove from Cart
                                        </button>
                                    ) : (
                                        <span style={{ width: '140px' }}></span> // Keeps layout consistent
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default ViewProduct;
