import React, { useState } from 'react';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar2 from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = () => {
    const cart = useCart();
    const dispatch = useDispatchCart();
    const navigate = useNavigate();

    const [shippingOption, setShippingOption] = useState('standard');

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.price, 0);
    };

    const calculateGST = (subtotal) => {
        return subtotal * 0.10;
    };

    const getShippingCost = () => {
        switch (shippingOption) {
            case 'express':
                return 9.99;
            case 'nextDay':
                return 14.99;
            default:
                return 0.00;
        }
    };

    const subtotal = calculateSubtotal();
    const gst = calculateGST(subtotal);
    const shippingCost = getShippingCost();
    const total = subtotal + gst + shippingCost;

    return (
        <>
            <Navbar />
            <section className="page-header py-5 bg-primary text-white mt-5">
                <div className="container">
                    <h1 className="display-4 text-white fw-bold">Shopping Cart</h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/" className="text-white">Home</Link></li>
                            <li className="breadcrumb-item active text-white-50" aria-current="page">Cart</li>
                        </ol>
                    </nav>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="row">
                        {/* Cart Items Section */}
                        <div className="col-lg-8 mb-4 mb-lg-0">
                            <div className="card mb-4">
                                <div className="card-header bg-white py-3 d-flex justify-content-between">
                                    <h5>Cart Items ({cart.length})</h5>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => dispatch({ type: "DROP" })}
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                                <div className="card-body">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                                            <h3>Your cart is empty</h3>
                                            <p className="text-muted">Add items to your cart to see them here.</p>
                                            <Link to="/products" className="btn btn-primary mt-3">Continue Shopping</Link>
                                        </div>
                                    ) : (
                                        cart.map((item, id) => (
                                            <div className="cart-item mb-3 pb-3 border-bottom" key={id}>
                                                <div className="row align-items-center">
                                                    <div className="col-md-2 col-4">
                                                        <img src={item.img} alt={item.name} className="img-fluid rounded" loading="lazy" />
                                                    </div>
                                                    <div className="col-md-4 col-8">
                                                        <h5>{item.name}</h5>
                                                        <p className="text-muted small">{item.size} meter</p>
                                                    </div>
                                                    <div className="col-md-2 col-4">
                                                        <span>{item.qty} QTY</span>
                                                    </div>
                                                    <div className="col-md-2 col-4 text-md-center">
                                                        <span className="fw-bold">${(item.price).toFixed(2)}</span>
                                                    </div>
                                                    <div className="col-md-2 col-4 text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => dispatch({ type: "REMOVE", item })}
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="card-footer bg-white py-3">
                                    <div className="row">
                                        <div className="col-md-6 mb-3 mb-md-0">
                                            <div className="input-group">
                                                {/* <input type="text" className="form-control" placeholder="Promo code" />
                                                <button className="btn btn-outline-primary" type="button">Apply</button> */}
                                            </div>
                                        </div>
                                        <div className="col-md-6 text-md-end">
                                            <Link to="/" className="btn btn-outline-primary">Continue Shopping</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="col-lg-4">
                            <div className="card">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Order Summary</h5>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span className="fw-bold">${subtotal.toFixed(2)} AUD</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>GST (10%)</span>
                                        <span className="fw-bold">${gst.toFixed(2)}</span>
                                    </div>
                                    {/* <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping</span>
                                        <span className="fw-bold">${shippingCost.toFixed(2)}</span>
                                    </div> */}
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Discount</span>
                                        <span className="fw-bold text-danger">-$0.00</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="h5">Total</span>
                                        <span className="h5">${total.toFixed(2)} AUD</span>
                                    </div>
                                    <Link to="/checkoutpage" className="btn btn-primary w-100">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            </div>

                            {/* Shipping Methods */}
                            {/* <div className="card mt-4">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Shipping Method</h5>
                                </div>
                                <div className="card-body">
                                    <div className="form-check mb-3">
                                        <input className="form-check-input" type="radio" name="shipping" id="standardShipping"
                                            value="standard" checked={shippingOption === 'standard'}
                                            onChange={(e) => setShippingOption(e.target.value)} />
                                        <label className="form-check-label d-flex justify-content-between" htmlFor="standardShipping">
                                            <span>Standard Shipping (3-5 days)</span><span>Free</span>
                                        </label>
                                    </div>
                                    <div className="form-check mb-3">
                                        <input className="form-check-input" type="radio" name="shipping" id="expressShipping"
                                            value="express" checked={shippingOption === 'express'}
                                            onChange={(e) => setShippingOption(e.target.value)} />
                                        <label className="form-check-label d-flex justify-content-between" htmlFor="expressShipping">
                                            <span>Express Shipping (1-2 days)</span><span>$9.99</span>
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="shipping" id="nextDayShipping"
                                            value="nextDay" checked={shippingOption === 'nextDay'}
                                            onChange={(e) => setShippingOption(e.target.value)} />
                                        <label className="form-check-label d-flex justify-content-between" htmlFor="nextDayShipping">
                                            <span>Next Day Delivery</span><span>$14.99</span>
                                        </label>
                                    </div>
                                </div>
                            </div> */}

                            {/* Payment Methods */}
                            <div className="card mt-4">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">We Accept</h5>
                                </div>
                                <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    Credit/Debit Cards<i className="bi bi-credit-card fs-2 text-primary"></i>
                                    {/* <i className="bi bi-paypal fs-2 text-primary"></i>
                                    <i className="bi bi-apple fs-2 text-primary"></i>
                                    <i className="bi bi-google fs-2 text-primary"></i> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default CartPage;
