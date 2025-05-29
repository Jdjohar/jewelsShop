import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar2';
import { useDispatchCart, useCart } from '../components/ContextReducer';

const ViewProduct = () => {
    const { productId } = useParams();
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
            setPrice(Number(selectedOption));  // Convert to number here
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
        }
    };

    const removeFromCart = () => {
        dispatch({
            type: 'REMOVE',
            id: product._id,
            size: selectedSize,
        });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://jewelsshop.onrender.com/api/auth/getproducts/${productId}`);
                const data = await response.json();
                if (response.status === 200) {
                    setProduct(data.data);
                    if (data.data.options?.length > 0) {
                        const firstSize = Object.keys(data.data.options[0])[0];
                        setSelectedSize(firstSize);
                        setPrice(Number(data.data.options[0][firstSize]));
                    }
                } else {
                    console.error('Failed to fetch product:', data.message);
                }
            } catch (error) {
                console.error('Error fetching product:', error.message);
            }
        };

        fetchProduct();
    }, [productId]);

    return (
        <div>
            <Navbar />
            <section className="py-5">
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
                                        {product.options && Object.keys(product.options[0]).map((size) => (
                                            <button
                                                key={size}
                                                className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'} me-2`}
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
                                    <button className="btn btn-danger" onClick={removeFromCart}>
                                        <i className="bi bi-trash me-2"></i> Remove from Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ViewProduct;
